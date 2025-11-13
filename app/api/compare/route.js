import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';
import { query, transaction } from '../../../lib/neon-db.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401, headers }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401, headers }
      );
    }

    const { prompts } = await request.json();
    const userId = decodedToken.uid;
    
    if (!prompts || prompts.length < 2) {
      return NextResponse.json({ 
        error: 'Need at least 2 prompts to compare' 
      }, { status: 400, headers });
    }

    if (prompts.length > 5) {
      return NextResponse.json({ 
        error: 'Maximum 5 prompts can be compared' 
      }, { status: 400, headers });
    }

    // Get user data from Neon Postgres
    const userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [userId]
    );

    let userData;
    if (userResult.rows.length === 0) {
      // Create user if doesn't exist
      const newUserResult = await query(`
        INSERT INTO users (firebase_uid, email, credits, subscription_tier, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `, [userId, decodedToken.email, 10, 'free']);
      
      userData = newUserResult.rows[0];
      console.log('Created new user in Neon for:', userId);
    } else {
      userData = userResult.rows[0];
    }

    // Calculate remaining credits using the same logic as frontend
    let remainingCredits = 0;
    
    if (userData.subscription) {
      const { credits, usedCredits } = userData.subscription;
      remainingCredits = Math.max(0, (credits || 5) - (usedCredits || 0));
      console.log('API credits calculation:', { credits, usedCredits, remainingCredits });
    } else if (userData.credits !== undefined) {
      // Backward compatibility with old structure
      remainingCredits = Math.max(0, userData.credits);
    } else {
      remainingCredits = 5; // Default for new users
    }
    
    console.log('API credits check - User:', userId, 'Credits:', remainingCredits); // Debug log

    // Check if user has credits
    if (remainingCredits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan to continue.' },
        { status: 403, headers }
      );
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('Groq API key not configured');
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 500, headers }
      );
    }

    // Groq AI is initialized at the top of the file

    // Build comparison prompt
    const promptsList = prompts.map((p, i) => `
PROMPT ${i + 1}: ${p.title}
${p.prompt}
`).join('\n---\n');

    const comparisonPrompt = `Analyze and compare these AI prompts. Return ONLY valid JSON (no markdown, no code blocks):

${promptsList}

For each prompt, score these metrics from 0-100:
- Clarity: How clear and understandable are the instructions?
- Specificity: How specific and detailed are the requirements?
- Completeness: Does it cover everything needed for the task?

Calculate an overall score as the average of the three metrics.

Return JSON in this exact format:
{
  "recommendation": "Which prompt is best and why (2-3 sentences)",
  "scores": [
    {
      "title": "Prompt title here",
      "score": 85,
      "efficiency": "Excellent|Very Good|Good|Fair|Poor",
      "metrics": {
        "clarity": 90,
        "specificity": 85,
        "completeness": 80
      },
      "analysis": "Specific strengths and weaknesses (2-3 sentences)"
    }
  ]
}`;

    console.log('Compare: Analyzing prompts...');
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert prompt analyst. Analyze prompts and return detailed JSON comparisons."
        },
        {
          role: "user",
          content: comparisonPrompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 2000,
    });
    const text = response.choices[0]?.message?.content?.trim();
    
    // Parse JSON response
    let cleanText = text;
    
    // Remove markdown code blocks if present
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Find JSON boundaries
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd);
    }
    
    let analysis;
    try {
      analysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text:', text);
      console.error('Clean text:', cleanText);
      
      // Fallback response
      analysis = {
        recommendation: "Unable to parse detailed analysis. All prompts have been reviewed.",
        scores: prompts.map((p, i) => ({
          title: p.title,
          score: 75,
          efficiency: "Good",
          metrics: {
            clarity: 75,
            specificity: 75,
            completeness: 75
          },
          analysis: "Analysis temporarily unavailable due to parsing error."
        }))
      };
    }

    // Handle credit deduction using Neon transaction
    try {
      const newCreditsRemaining = await transaction(async (client) => {
        // Get current user data
        const userResult = await client.query(
          'SELECT * FROM users WHERE firebase_uid = $1',
          [userId]
        );

        if (userResult.rows.length === 0) {
          throw new Error('User not found');
        }

        const currentUserData = userResult.rows[0];
        
        // Calculate current remaining credits
        let currentRemainingCredits = 0;
        if (currentUserData.subscription && typeof currentUserData.subscription === 'object') {
          const { credits, usedCredits } = currentUserData.subscription;
          currentRemainingCredits = Math.max(0, (credits || 5) - (usedCredits || 0));
        } else if (currentUserData.credits !== undefined) {
          currentRemainingCredits = Math.max(0, currentUserData.credits);
        } else {
          currentRemainingCredits = 5;
        }
        
        if (currentRemainingCredits < 1) {
          throw new Error('Insufficient credits');
        }
        
        // Update credits based on the system being used
        if (currentUserData.subscription && typeof currentUserData.subscription === 'object') {
          // Update usedCredits in subscription system
          const newUsedCredits = (currentUserData.subscription.usedCredits || 0) + 1;
          await client.query(`
            UPDATE users 
            SET subscription = jsonb_set(subscription, '{usedCredits}', $1::text::jsonb),
                updated_at = NOW()
            WHERE firebase_uid = $2
          `, [newUsedCredits.toString(), userId]);
          return currentRemainingCredits - 1;
        } else {
          // Update credits directly (old system)
          await client.query(`
            UPDATE users 
            SET credits = credits - 1,
                updated_at = NOW()
            WHERE firebase_uid = $1
          `, [userId]);
          return Math.max(0, (currentUserData.credits || 0) - 1);
        }
      });

      return NextResponse.json({
        success: true,
        analysis,
        creditsRemaining: newCreditsRemaining
      }, { headers });

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      
      if (transactionError.message === 'Insufficient credits') {
        return NextResponse.json(
          { 
            error: 'Insufficient credits. Please upgrade your plan to continue.',
            creditsRemaining: 0,
            needsUpgrade: true,
          },
          { status: 402, headers }
        );
      }

      return NextResponse.json(
        { error: 'Failed to process request. Please try again.' },
        { status: 500, headers }
      );
    }

  } catch (error) {
    console.error('Compare error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({ 
      error: 'Failed to compare prompts. Please try again.',
      details: error.message
    }, { status: 500, headers });
  }
}
