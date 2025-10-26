import { NextResponse } from 'next/server';
import crypto from 'crypto';
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

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planDetails 
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const userId = decodedToken.uid;

    // Calculate subscription end date
    const now = new Date();
    const subscriptionEnd = new Date(now);
    if (planDetails.billingCycle === 'yearly') {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    // Update user subscription in Firestore
    const userRef = adminDb.collection('users').doc(userId);
    
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const currentData = userDoc.data();
      
      // Update user with new subscription
      transaction.update(userRef, {
        subscriptionTier: planDetails.id,
        credits: planDetails.credits,
        subscriptionStart: now,
        subscriptionEnd: subscriptionEnd,
        lastPaymentId: razorpay_payment_id,
        lastPaymentDate: now,
        billingCycle: planDetails.billingCycle,
      });

      // Create payment record
      const paymentRef = adminDb.collection('payments').doc();
      transaction.set(paymentRef, {
        userId: userId,
        userEmail: decodedToken.email,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount: planDetails.price,
        currency: 'INR',
        planId: planDetails.id,
        planName: planDetails.name,
        billingCycle: planDetails.billingCycle,
        credits: planDetails.credits,
        status: 'completed',
        createdAt: now,
        subscriptionStart: now,
        subscriptionEnd: subscriptionEnd,
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        tier: planDetails.id,
        credits: planDetails.credits,
        billingCycle: planDetails.billingCycle,
        subscriptionEnd: subscriptionEnd.toISOString(),
      },
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to verify payment. Please contact support.' },
      { status: 500 }
    );
  }
}
