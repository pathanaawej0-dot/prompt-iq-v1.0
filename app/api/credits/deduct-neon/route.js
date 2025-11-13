import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase-admin';
import { query, transaction } from '../../../../lib/neon-db.js';

export async function POST(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401 }
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
        { status: 401 }
      );
    }

    const firebaseUid = decodedToken.uid;

    // Get the request body
    const { originalPrompt, enhancedPrompt } = await request.json();

    if (!originalPrompt || !enhancedPrompt) {
      return NextResponse.json(
        { error: 'Original and enhanced prompts are required' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomicity
    const result = await transaction(async (client) => {
      // Get user data
      const userResult = await client.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userData = userResult.rows[0];
      
      // Calculate available credits
      let availableCredits = 0;
      let subscriptionTier = userData.subscription_tier || 'free';
      
      if (userData.subscription_credits && userData.subscription_used_credits !== null) {
        // New subscription structure
        availableCredits = userData.subscription_credits - userData.subscription_used_credits;
      } else {
        // Backward compatibility
        availableCredits = userData.credits || 0;
      }

      // Check if user has unlimited credits (business plan)
      if (subscriptionTier === 'business' && userData.subscription_credits >= 1000) {
        // Save to history without deducting credits for business plan
        await client.query(`
          INSERT INTO prompts (user_id, firebase_uid, original_prompt, enhanced_prompt, credits_used, plan_id, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [userData.id, firebaseUid, originalPrompt.trim(), enhancedPrompt.trim(), 0, subscriptionTier]);

        return {
          success: true,
          creditsRemaining: 'unlimited',
          subscriptionTier,
          message: 'Prompt enhanced successfully',
        };
      }

      // Check if user has enough credits
      if (availableCredits <= 0) {
        return {
          error: 'Insufficient credits',
          creditsRemaining: 0,
          subscriptionTier,
          needsUpgrade: true,
          status: 402
        };
      }

      // Deduct credits based on structure
      if (userData.subscription_credits && userData.subscription_used_credits !== null) {
        // New subscription structure - increment used credits
        await client.query(`
          UPDATE users 
          SET subscription_used_credits = subscription_used_credits + 1,
              used_credits = used_credits + 1,
              updated_at = NOW()
          WHERE firebase_uid = $1
        `, [firebaseUid]);
      } else {
        // Old structure - decrement credits
        await client.query(`
          UPDATE users 
          SET credits = credits - 1,
              used_credits = used_credits + 1,
              updated_at = NOW()
          WHERE firebase_uid = $1
        `, [firebaseUid]);
      }

      // Add prompt to history
      await client.query(`
        INSERT INTO prompts (
          user_id, firebase_uid, original_prompt, enhanced_prompt, 
          credits_used, plan_id, subscription_credits, subscription_used_credits, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        userData.id, 
        firebaseUid, 
        originalPrompt.trim(), 
        enhancedPrompt.trim(), 
        1, 
        subscriptionTier,
        userData.subscription_credits,
        (userData.subscription_used_credits || 0) + 1
      ]);

      const newAvailableCredits = availableCredits - 1;

      return {
        success: true,
        creditsRemaining: newAvailableCredits,
        totalCredits: userData.subscription_credits || userData.credits,
        usedCredits: (userData.subscription_used_credits || userData.used_credits || 0) + 1,
        subscriptionTier,
        message: 'Prompt enhanced and saved to history',
      };
    });

    if (result.error) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Credits deduction error:', error);
    
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Insufficient credits') {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          creditsRemaining: 0,
          needsUpgrade: true,
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
