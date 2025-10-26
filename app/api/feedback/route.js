import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

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

    const userId = decodedToken.uid;

    // Get user data for context
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    const userData = userDoc.exists() ? userDoc.data() : {};

    // Save feedback to Firebase
    await adminDb.collection('feedback').add({
      userId: userId,
      userEmail: userData.email || decodedToken.email,
      feedback: feedback.trim(),
      rating: parseInt(rating),
      timestamp: new Date(),
      userTier: userData.subscriptionTier || 'free',
      userCredits: userData.credits || 0,
    });

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
