import { NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase-admin';
import { query, transaction } from '../../../../lib/neon-db.js';

export async function GET(request) {
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

    // Get user from Neon Postgres
    const userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    if (userResult.rows.length === 0) {
      // User doesn't exist in Neon, create them
      const newUserResult = await query(`
        INSERT INTO users (firebase_uid, email, credits, subscription_tier, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [firebaseUid, decodedToken.email, 5, 'free']);

      const userData = newUserResult.rows[0];
      
      return NextResponse.json({
        success: true,
        profile: {
          uid: userData.firebase_uid,
          email: userData.email,
          credits: userData.credits || 0,
          subscriptionTier: userData.subscription_tier || 'free',
          createdAt: userData.created_at,
        },
      });
    }

    const userData = userResult.rows[0];

    // Calculate available credits based on subscription structure
    let availableCredits = 0;
    if (userData.subscription_credits && userData.subscription_used_credits !== null) {
      // New subscription structure
      availableCredits = userData.subscription_credits - userData.subscription_used_credits;
    } else {
      // Backward compatibility with old structure
      availableCredits = userData.credits || 0;
    }

    return NextResponse.json({
      success: true,
      profile: {
        uid: userData.firebase_uid,
        email: userData.email,
        credits: availableCredits,
        subscriptionTier: userData.subscription_tier || 'free',
        createdAt: userData.created_at,
        subscriptionStart: userData.subscription_start,
        subscriptionEnd: userData.subscription_end,
        billingCycle: userData.billing_cycle,
      },
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
