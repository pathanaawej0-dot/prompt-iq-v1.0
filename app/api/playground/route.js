import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
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
    // Get the authorization header (same as dashboard)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401, headers }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token (same as dashboard)
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
    const { userQuery, mode } = await request.json();
    const userId = decodedToken.uid;

    if (!userQuery || userQuery.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400, headers }
      );
    }

    if (!mode || !['generate', 'test'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode must be either "generate" or "test"' },
        { status: 400, headers }
      );
    }

    console.log('Query length:', userQuery.length, 'Query:', userQuery.substring(0, 100) + '...'); // Debug log
    

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('Groq API key not configured');
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 500, headers }
      );
    }

    // Groq AI is initialized at the top of the file

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
    
    // Handle both old and new user profile structures (same as dashboard)
    let remainingCredits = 0;
    
    if (userData.subscription) {
      const { credits, usedCredits } = userData.subscription;
      remainingCredits = Math.max(0, credits - (usedCredits || 0));
    } else if (userData.credits !== undefined) {
      remainingCredits = userData.credits || 0;
    } else {
      remainingCredits = 5;
    }

    // Check if user has credits
    if (remainingCredits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan to continue.' },
        { status: 403, headers }
      );
    }

    let result = {};

    try {

    if (mode === 'generate') {
      // GENERATE MODE: Optimize prompt only
      const optimizePrompt = `You are an expert prompt engineer. Transform this simple user query into a detailed, professional AI prompt:

USER QUERY: "${userQuery}"

Create an optimized prompt that:
- Adds necessary context and background
- Specifies clear, actionable instructions
- Defines the desired output format and structure
- Includes relevant constraints and requirements
- Makes it immediately usable with any AI tool

Return ONLY the optimized prompt text, no explanations, no markdown formatting.`;

      console.log('Playground: Generating optimized prompt...');
      const optimizeResult = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert prompt engineer. Transform user requests into optimized, professional prompts."
          },
          {
            role: "user",
            content: optimizePrompt
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1500,
      });
      let optimizedPrompt = optimizeResult.choices[0]?.message?.content?.trim();
      
      // Clean up the response
      if (optimizedPrompt.startsWith('"') && optimizedPrompt.endsWith('"')) {
        optimizedPrompt = optimizedPrompt.slice(1, -1);
      }
      
      result.optimizedPrompt = optimizedPrompt;

    } else if (mode === 'test') {
      // TEST MODE: Execute the prompt and return result
      console.log('Playground: Testing prompt...');
      const executeResult = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: userQuery
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2000,
      });
      let testResult = executeResult.choices[0]?.message?.content?.trim();
      
      // Clean up the response
      if (testResult.startsWith('"') && testResult.endsWith('"')) {
        testResult = testResult.slice(1, -1);
      }
      
      result.result = testResult;
    }

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate AI response. Please try again.' },
        { status: 500, headers }
      );
    }

    // Deduct credits using transaction (same as enhance route)
    try {
    const newCreditsRemaining = await transaction(async (client) => {
      const userResult = await client.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userData = userResult.rows[0];
      
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
        `, [userId]);
        
        return availableCredits - 1;
      } else {
        // Old structure - decrement credits
        await client.query(`
          UPDATE users 
          SET credits = credits - 1,
              updated_at = NOW()
          WHERE firebase_uid = $1
        `, [userId]);
        
        return Math.max(0, (userData.credits || 0) - 1);
      }
    });

      // Add to history in Neon Postgres
      let enhancedPrompt = null;
      let aiResponse = null;

      if (mode === 'generate') {
        enhancedPrompt = result.optimizedPrompt;
      } else if (mode === 'test') {
        aiResponse = result.result;
      }

      await query(`
        INSERT INTO prompts (user_id, firebase_uid, original_prompt, enhanced_prompt, ai_response, source, credits_used, created_at)
        SELECT id, $1, $2, $3, $4, $5, $6, NOW()
        FROM users WHERE firebase_uid = $7
      `, [userId, userQuery.trim(), enhancedPrompt, aiResponse, mode === 'generate' ? 'playground_generate' : 'playground_test', 1, userId]);

      console.log('API returning result:', result); // Debug log
      return NextResponse.json({
        success: true,
        ...result,
        creditsRemaining: newCreditsRemaining,
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
    console.error('Playground error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Handle specific Gemini API errors (same as dashboard)
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
        { error: 'Content not suitable for processing. Please try a different query.' },
        { status: 400, headers }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response. Please try again later.' },
      { status: 500, headers }
    );
  }
}
