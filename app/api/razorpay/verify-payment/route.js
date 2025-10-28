import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminAuth, adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId 
    } = await request.json();

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Get order details from Firestore
    const orderDoc = await adminDb.collection('orders').doc(razorpay_order_id).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderDoc.data();
    
    // Verify order belongs to user
    if (orderData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized order access' }, { status: 401 });
    }

    // Update order status
    await adminDb.collection('orders').doc(razorpay_order_id).update({
      status: 'completed',
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      completedAt: new Date().toISOString()
    });

    // Update user subscription and credits
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      await userRef.set({
        email: decodedToken.email,
        displayName: decodedToken.name || '',
        createdAt: new Date().toISOString()
      });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Update user with new subscription
    await userRef.update({
      subscription: {
        planId: orderData.planId,
        planName: orderData.planName,
        status: 'active',
        credits: orderData.credits,
        usedCredits: 0,
        price: orderData.amount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      },
      credits: orderData.credits, // For backward compatibility
      usedCredits: 0,
      subscriptionTier: orderData.planId,
      lastPaymentDate: new Date().toISOString()
    });

    // Log transaction
    await adminDb.collection('transactions').add({
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      planId: orderData.planId,
      planName: orderData.planName,
      amount: orderData.amount,
      credits: orderData.credits,
      status: 'success',
      createdAt: new Date().toISOString(),
      type: 'subscription_purchase'
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        planId: orderData.planId,
        planName: orderData.planName,
        credits: orderData.credits,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    
    // Log failed transaction
    try {
      await adminDb.collection('transactions').add({
        userId: request.body?.userId || 'unknown',
        orderId: request.body?.razorpay_order_id || 'unknown',
        paymentId: request.body?.razorpay_payment_id || 'unknown',
        status: 'failed',
        error: error.message,
        createdAt: new Date().toISOString(),
        type: 'subscription_purchase'
      });
    } catch (logError) {
      console.error('Error logging failed transaction:', logError);
    }

    return NextResponse.json(
      { error: 'Payment verification failed', details: error.message },
      { status: 500 }
    );
  }
}
