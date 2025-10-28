import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      userId,
    } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Define plan details
    const planDetails = {
      starter: {
        name: 'Starter',
        price: 99,
        credits: 30,
        features: ['30 enhanced prompts', 'Advanced optimization', 'Priority support', '30-day history'],
      },
      creator: {
        name: 'Creator',
        price: 249,
        credits: 100,
        features: ['100 enhanced prompts', 'Pro optimization', '24/7 priority support', '90-day history', 'Custom templates', 'API access (beta)'],
      },
      pro: {
        name: 'Pro',
        price: 599,
        credits: 300,
        features: ['300 enhanced prompts', 'Premium optimization', 'Dedicated support', 'Unlimited history', 'Custom template library', 'Full API access', 'Team collaboration (3 users)'],
      },
      business: {
        name: 'Business',
        price: 1499,
        credits: 1000,
        features: ['1000 enhanced prompts', 'Enterprise optimization', 'Priority 24/7 support', 'Unlimited history', 'Custom prompt library', 'Advanced API', 'Team collaboration (10 users)', 'Analytics dashboard', 'White-label option'],
      },
    };

    const selectedPlan = planDetails[planId];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Calculate subscription end date (30 days from now)
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

    // Update user subscription in Firestore
    const userRef = adminDb.collection('users').doc(userId);
    
    await userRef.update({
      subscription: {
        planId: planId,
        planName: selectedPlan.name,
        status: 'active',
        credits: selectedPlan.credits,
        usedCredits: 0,
        price: selectedPlan.price,
        startDate: subscriptionStart,
        endDate: subscriptionEnd,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        lastUpdated: new Date(),
      },
      updatedAt: new Date(),
    });

    // Log the payment transaction
    await adminDb.collection('transactions').add({
      userId: userId,
      planId: planId,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      currency: 'INR',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'completed',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: {
        planId: planId,
        planName: selectedPlan.name,
        credits: selectedPlan.credits,
        endDate: subscriptionEnd,
      },
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
