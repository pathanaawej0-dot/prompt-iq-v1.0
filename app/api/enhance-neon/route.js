import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { adminAuth } from '../../../lib/firebase-admin';
import { query, transaction } from '../../../lib/neon-db.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Handle CORS preflight requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request) {
  // Add CORS headers
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

    // Get the request body
    const { originalPrompt } = await request.json();

    if (!originalPrompt || originalPrompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Original prompt is required' },
        { status: 400, headers }
      );
    }

    if (originalPrompt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Prompt must be at least 10 characters long' },
        { status: 400, headers }
      );
    }

    if (originalPrompt.length > 2000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Please keep it under 2000 characters.' },
        { status: 400, headers }
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
    
    console.log('API Key present:', process.env.GROQ_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', process.env.GROQ_API_KEY?.length || 0);

    // System prompt for enhancement
    const systemPrompt = `You are an expert prompt enhancer. Transform the user's basic request into a detailed, professional, ready-to-use prompt that can be directly copied and pasted to any AI model.

Guidelines:
- Create a DIRECT prompt that starts with "You are..." or "Your task is..."
- Make it immediately usable - no meta-instructions
- Include specific role, task, context, and output format
- Add relevant constraints and guidelines
- Make it comprehensive and action-oriented
- Structure it professionally with clear sections

Return ONLY the final enhanced prompt - ready to copy and paste.

User's request to enhance:`;

    const fullPrompt = `${systemPrompt}\n\n"${originalPrompt}"`;

    // Generate enhanced prompt
    console.log('Calling Groq API with prompt:', originalPrompt);
    const result = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: originalPrompt.trim()
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 2000,
    });
    const enhancedPrompt = result.choices[0]?.message?.content;
    console.log('Groq API response received:', enhancedPrompt ? 'Success' : 'Empty');

    if (!enhancedPrompt || enhancedPrompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate enhanced prompt. Please try again.' },
        { status: 500, headers }
      );
    }

    // Clean up the response (remove quotes if they wrap the entire response)
    let cleanedPrompt = enhancedPrompt.trim();
    if (cleanedPrompt.startsWith('"') && cleanedPrompt.endsWith('"')) {
      cleanedPrompt = cleanedPrompt.slice(1, -1);
    }

    const firebaseUid = decodedToken.uid;

    // Handle credit deduction and history saving using transaction with timeout handling
    let transactionResult;
    try {
      transactionResult = await Promise.race([
        transaction(async (client) => {
      // Get user data
      const userResult = await client.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );

      let userData;
      if (userResult.rows.length === 0) {
        // Create user if doesn't exist
        const newUserResult = await client.query(`
          INSERT INTO users (firebase_uid, email, credits, subscription_tier, created_at)
          VALUES ($1, $2, $3, $4, NOW())
          RETURNING *
        `, [firebaseUid, decodedToken.email, 5, 'free']);
        userData = newUserResult.rows[0];
      } else {
        userData = userResult.rows[0];
      }

      // Calculate available credits
      let availableCredits = 0;
      if (userData.subscription_credits && userData.subscription_used_credits !== null) {
        // New subscription structure
        availableCredits = userData.subscription_credits - userData.subscription_used_credits;
      } else {
        // Backward compatibility
        availableCredits = userData.credits || 0;
      }

      // Check if user has credits
      if (availableCredits <= 0) {
        throw new Error('Insufficient credits');
      }

      // Deduct credits based on structure
      if (userData.subscription_credits && userData.subscription_used_credits !== null) {
        // New subscription structure - increment used credits
        await client.query(`
          UPDATE users 
          SET subscription_used_credits = subscription_used_credits + 1,
              updated_at = NOW()
          WHERE firebase_uid = $1
        `, [firebaseUid]);
        
        return availableCredits - 1;
      } else {
        // Old structure - decrement credits
        await client.query(`
          UPDATE users 
          SET credits = credits - 1,
              updated_at = NOW()
          WHERE firebase_uid = $1
        `, [firebaseUid]);
        
        return availableCredits - 1;
      }
    }),
    // Timeout after 15 seconds
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timeout')), 15000)
    )
  ]);
} catch (dbError) {
  console.error('Database transaction error:', dbError);
  
  // If database fails, still return success since Gemini worked
  // User will see the enhanced prompt but credits won't be deducted
  return NextResponse.json({
    success: true,
    originalPrompt: originalPrompt.trim(),
    enhancedPrompt: cleanedPrompt,
    timestamp: new Date().toISOString(),
    creditsRemaining: 'unknown', // Indicate we couldn't update credits
    warning: 'Enhanced prompt generated but credits not updated due to database timeout'
  }, { headers });
}

    // Add prompt to history (outside transaction for better performance)
    try {
      await query(`
        INSERT INTO prompts (user_id, firebase_uid, original_prompt, enhanced_prompt, source, credits_used, created_at)
        SELECT id, $1, $2, $3, $4, $5, NOW()
        FROM users WHERE firebase_uid = $1
      `, [firebaseUid, originalPrompt.trim(), cleanedPrompt, 'dashboard', 1]);
    } catch (historyError) {
      console.error('Failed to save prompt history:', historyError);
      // Continue anyway - the main functionality worked
    }

    return NextResponse.json({
      success: true,
      originalPrompt: originalPrompt.trim(),
      enhancedPrompt: cleanedPrompt,
      timestamp: new Date().toISOString(),
      creditsRemaining: transactionResult,
    }, { headers });

  } catch (error) {
    console.error('Enhancement error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Handle specific errors
    if (error.message === 'Insufficient credits') {
      return NextResponse.json(
        { 
          error: 'Insufficient credits. Please upgrade your plan to continue.',
          creditsRemaining: 0,
          needsUpgrade: true,
        },
        { status: 402, headers }
      );
    }
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API_KEY')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500, headers }
      );
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return NextResponse.json(
        { error: 'AI service temporarily overloaded. Please try again in a moment.' },
        { status: 429, headers }
      );
    }

    if (error.message?.includes('safety') || error.message?.includes('blocked')) {
      return NextResponse.json(
        { error: 'Content not suitable for enhancement. Please try a different prompt.' },
        { status: 400, headers }
      );
    }

    return NextResponse.json(
      { error: 'Failed to enhance prompt. Please try again later.' },
      { status: 500, headers }
    );
  }
}
