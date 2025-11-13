import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebase-admin';
import { query } from '../../../lib/neon-db.js';

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

    const { feedback, rating } = await request.json();

    if (!feedback || !feedback.trim()) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const firebaseUid = decodedToken.uid;

    // Get user data from Neon for context
    let userData = {};
    try {
      const userResult = await query(
        'SELECT email, subscription_tier, credits FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );
      
      if (userResult.rows.length > 0) {
        userData = userResult.rows[0];
      }
    } catch (userError) {
      console.error('Error fetching user data:', userError);
      // Continue anyway - we can still save feedback without user context
    }

    // Save feedback to Neon Postgres
    await query(`
      INSERT INTO feedback (
        firebase_uid, 
        user_email, 
        feedback_text, 
        rating, 
        user_tier, 
        user_credits,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      firebaseUid,
      userData.email || decodedToken.email,
      feedback.trim(),
      parseInt(rating),
      userData.subscription_tier || 'free',
      userData.credits || 0
    ]);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
