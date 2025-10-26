import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminAuth } from '../../../../lib/firebase-admin';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    const { planId, billingCycle = 'monthly' } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Define plan pricing
    const plans = {
      starter: {
        monthly: 99,
        yearly: 950, // 20% discount
        credits: 50,
        name: 'Starter Plan',
      },
      pro: {
        monthly: 299,
        yearly: 2870, // 20% discount
        credits: 200,
        name: 'Pro Plan',
      },
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const amount = selectedPlan[billingCycle];
    const currency = 'INR';

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: `order_${Date.now()}_${decodedToken.uid}`,
      notes: {
        planId,
        billingCycle,
        userId: decodedToken.uid,
        userEmail: decodedToken.email,
        credits: selectedPlan.credits,
        planName: selectedPlan.name,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planDetails: {
        id: planId,
        name: selectedPlan.name,
        credits: selectedPlan.credits,
        billingCycle,
        price: amount,
      },
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    
    if (error.error && error.error.code) {
      // Razorpay specific errors
      return NextResponse.json(
        { error: `Payment service error: ${error.error.description}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}
