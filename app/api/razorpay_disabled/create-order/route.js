import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay only when needed to avoid build errors
const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export async function POST(request) {
  try {
    const { planId, amount, currency = 'INR' } = await request.json();

    // Validate required fields
    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount (should be in paise)
    if (amount < 100) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Initialize Razorpay
    const razorpay = initRazorpay();

    // Create Razorpay order
    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `receipt_${planId}_${Date.now()}`,
      notes: {
        planId: planId,
        createdAt: new Date().toISOString(),
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
