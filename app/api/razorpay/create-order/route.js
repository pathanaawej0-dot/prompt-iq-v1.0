import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { adminAuth, adminDb } from '../../../../lib/firebase-admin';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { planId, userId } = await request.json();

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

    // Plan configurations
    const plans = {
      starter: {
        name: 'Starter',
        price: 399,
        amount: 39900,
        currency: 'INR',
        credits: 30,
        description: 'Great for students and beginners'
      },
      creator: {
        name: 'Creator',
        price: 799,
        amount: 79900,
        currency: 'INR',
        credits: 100,
        description: 'Perfect for freelancers and content creators'
      },
      pro: {
        name: 'Pro',
        price: 1599,
        amount: 159900,
        currency: 'INR',
        credits: 300,
        description: 'For professionals and small businesses'
      },
      test: {
        name: 'Test',
        price: 1,
        amount: 100,
        currency: 'INR',
        credits: 5,
        description: 'Testing plan for development'
      },
      business: {
        name: 'Business',
        price: 3999,
        amount: 399900,
        currency: 'INR',
        credits: 1000,
        description: 'For agencies and growing teams'
      }
    };

    const selectedPlan = plans[planId];
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create Razorpay order
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const userIdShort = userId.slice(-8); // Last 8 chars of userId
    const options = {
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      receipt: `rcpt_${userIdShort}_${timestamp}`, // Max 40 chars
      notes: {
        planId,
        planName: selectedPlan.name,
        userId,
        credits: selectedPlan.credits.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    // Store order in Firestore for verification
    await adminDb.collection('orders').doc(order.id).set({
      orderId: order.id,
      userId,
      planId,
      planName: selectedPlan.name,
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      credits: selectedPlan.credits,
      status: 'created',
      createdAt: new Date().toISOString(),
      receipt: options.receipt
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      plan: selectedPlan,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}
