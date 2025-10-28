import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebase-admin';

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

    const userId = decodedToken.uid;

    // Get the request body
    const { originalPrompt, enhancedPrompt } = await request.json();

    if (!originalPrompt || !enhancedPrompt) {
      return NextResponse.json(
        { error: 'Original and enhanced prompts are required' },
        { status: 400 }
      );
    }

    // Get user document
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Get credits from new subscription structure
    const subscription = userData.subscription || {};
    const currentCredits = subscription.credits || 0;
    const usedCredits = subscription.usedCredits || 0;
    const availableCredits = currentCredits - usedCredits;
    const subscriptionTier = subscription.planId || 'free';

    // Check if user has unlimited credits (business plan)
    if (subscriptionTier === 'business' && subscription.credits >= 1000) {
      // Save to history without deducting credits for business plan
      await adminDb.collection('prompts').add({
        uid: userId,
        originalPrompt: originalPrompt.trim(),
        enhancedPrompt: enhancedPrompt.trim(),
        timestamp: new Date(),
        creditsUsed: 0, // No credits deducted for business plan
        planId: subscriptionTier
      });

      return NextResponse.json({
        success: true,
        creditsRemaining: 'unlimited',
        subscriptionTier,
        message: 'Prompt enhanced successfully',
      });
    }

    // Check if user has enough credits
    if (availableCredits <= 0) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          creditsRemaining: 0,
          subscriptionTier,
          needsUpgrade: true,
        },
        { status: 402 } // Payment Required
      );
    }

    // Use a transaction to ensure atomicity
    const newUsedCredits = usedCredits + 1;
    const newAvailableCredits = currentCredits - newUsedCredits;
    
    try {
      await adminDb.runTransaction(async (transaction) => {
        // Re-read user document in transaction
        const userSnapshot = await transaction.get(userRef);
        
        if (!userSnapshot.exists) {
          throw new Error('User not found');
        }

        const currentUserData = userSnapshot.data();
        const currentSubscription = currentUserData.subscription || {};
        const currentAvailableCredits = (currentSubscription.credits || 0) - (currentSubscription.usedCredits || 0);

        // Double-check credits in transaction
        if (currentAvailableCredits <= 0) {
          throw new Error('Insufficient credits');
        }

        // Update user subscription with new usedCredits
        transaction.update(userRef, {
          'subscription.usedCredits': (currentSubscription.usedCredits || 0) + 1,
          // Keep backward compatibility
          credits: Math.max(0, currentAvailableCredits - 1),
          usedCredits: (currentUserData.usedCredits || 0) + 1
        });

        // Add prompt to history
        const promptRef = adminDb.collection('prompts').doc();
        transaction.set(promptRef, {
          uid: userId,
          originalPrompt: originalPrompt.trim(),
          enhancedPrompt: enhancedPrompt.trim(),
          timestamp: new Date(),
          creditsUsed: 1,
          planId: subscriptionTier,
          subscriptionCredits: currentSubscription.credits,
          subscriptionUsedCredits: (currentSubscription.usedCredits || 0) + 1
        });
      });

      return NextResponse.json({
        success: true,
        creditsRemaining: newAvailableCredits,
        totalCredits: currentCredits,
        usedCredits: newUsedCredits,
        subscriptionTier,
        message: 'Prompt enhanced and saved to history',
      });

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      
      if (transactionError.message === 'Insufficient credits') {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            creditsRemaining: 0,
            subscriptionTier,
            needsUpgrade: true,
          },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to process request. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Credits deduction error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
