import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 500, headers }
      );
    }
    
    console.log('API Key present:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
    console.log('Calling Gemini API with prompt:', originalPrompt);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const enhancedPrompt = response.text();
    console.log('Gemini API response received:', enhancedPrompt ? 'Success' : 'Empty');

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

    const userId = decodedToken.uid;

    // Get user document to check credits and subscription
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers }
      );
    }

    const userData = userDoc.data();
    const currentCredits = userData.credits || 0;
    const subscriptionTier = userData.subscriptionTier || 'free';


    // Handle credit deduction and history saving
    if (subscriptionTier === 'ultimate') {
      // Save to history without deducting credits for ultimate users
      await adminDb.collection('prompts').add({
        uid: userId,
        originalPrompt: originalPrompt.trim(),
        enhancedPrompt: cleanedPrompt,
        timestamp: new Date(),
        creditsUsed: 0,
      });

      return NextResponse.json({
        success: true,
        originalPrompt: originalPrompt.trim(),
        enhancedPrompt: cleanedPrompt,
        timestamp: new Date().toISOString(),
        creditsRemaining: 'unlimited',
        subscriptionTier: subscriptionTier,
      }, { headers });
    } else {
      // Check if user has enough credits
      if (currentCredits <= 0) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits. Please upgrade your plan to continue.',
            creditsRemaining: 0,
            subscriptionTier,
            needsUpgrade: true,
          },
          { status: 402, headers }
        );
      }

      // Use transaction to deduct credits and save to history
      try {
        const newCredits = await adminDb.runTransaction(async (transaction) => {
          // Re-read user document in transaction
          const userSnapshot = await transaction.get(userRef);
          
          if (!userSnapshot.exists) {
            throw new Error('User not found');
          }

          const currentUserData = userSnapshot.data();
          const currentUserCredits = currentUserData.credits || 0;

          // Double-check credits in transaction
          if (currentUserCredits <= 0) {
            throw new Error('Insufficient credits');
          }

          const updatedCredits = currentUserCredits - 1;

          // Update user credits
          transaction.update(userRef, {
            credits: updatedCredits,
          });

          // Add prompt to history
          const promptRef = adminDb.collection('prompts').doc();
          transaction.set(promptRef, {
            uid: userId,
            originalPrompt: originalPrompt.trim(),
            enhancedPrompt: cleanedPrompt,
            timestamp: new Date(),
            creditsUsed: 1,
          });

          return updatedCredits;
        });

        return NextResponse.json({
          success: true,
          originalPrompt: originalPrompt.trim(),
          enhancedPrompt: cleanedPrompt,
          timestamp: new Date().toISOString(),
          creditsRemaining: newCredits,
          subscriptionTier,
        }, { headers });

      } catch (transactionError) {
        console.error('Transaction error:', transactionError);
        
        if (transactionError.message === 'Insufficient credits') {
          return NextResponse.json(
            { 
              error: 'Insufficient credits. Please upgrade your plan to continue.',
              creditsRemaining: 0,
              subscriptionTier,
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
    }

  } catch (error) {
    console.error('Enhancement error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
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
