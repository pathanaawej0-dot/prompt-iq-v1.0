import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const { email, planId } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get user info if authenticated
    let userId = null;
    let userEmail = null;
    
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
        userEmail = decodedToken.email;
      } catch (error) {
        // User not authenticated, continue as anonymous
        console.log('Anonymous email subscription');
      }
    }

    // Save email subscription to Firebase
    await adminDb.collection('email_subscriptions').add({
      email: email.toLowerCase().trim(),
      planId: planId,
      userId: userId,
      userEmail: userEmail,
      timestamp: new Date(),
      source: 'coming_soon_modal',
      status: 'subscribed',
    });

    return NextResponse.json({
      success: true,
      message: 'Email subscription saved successfully!',
    });

  } catch (error) {
    console.error('Email subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to save email subscription' },
      { status: 500 }
    );
  }
}
