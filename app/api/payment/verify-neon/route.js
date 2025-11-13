import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminAuth } from '../../../../lib/firebase-admin';
import { query, transaction } from '../../../../lib/neon-db.js';

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
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret || razorpaySecret === 'test_secret_placeholder') {
      return NextResponse.json(
        { error: 'Payment service not configured. Please contact support.' },
        { status: 503 }
      );
    }
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    const firebaseUid = decodedToken.uid;

    // Calculate subscription end date
    const now = new Date();
    const subscriptionEnd = new Date(now);
    if (planDetails.billingCycle === 'yearly') {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    // Update user subscription and create payment record using transaction
    const result = await transaction(async (client) => {
      // Get or create user
      let userResult = await client.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );

      let userId;
      if (userResult.rows.length === 0) {
        // Create user if doesn't exist
        const newUserResult = await client.query(`
          INSERT INTO users (firebase_uid, email, created_at)
          VALUES ($1, $2, NOW())
          RETURNING id
        `, [firebaseUid, decodedToken.email]);
        userId = newUserResult.rows[0].id;
      } else {
        userId = userResult.rows[0].id;
      }

      // Update user with new subscription
      await client.query(`
        UPDATE users SET
          subscription_tier = $2,
          credits = $3,
          subscription_plan_id = $4,
          subscription_credits = $3,
          subscription_used_credits = 0,
          subscription_start = $5,
          subscription_end = $6,
          last_payment_id = $7,
          last_payment_date = $5,
          billing_cycle = $8,
          updated_at = NOW()
        WHERE firebase_uid = $1
      `, [
        firebaseUid,
        planDetails.id,
        planDetails.credits,
        planDetails.id,
        now,
        subscriptionEnd,
        razorpay_payment_id,
        planDetails.billingCycle
      ]);

      // Create payment record
      await client.query(`
        INSERT INTO payments (
          user_id, firebase_uid, user_email, razorpay_order_id, razorpay_payment_id,
          amount, currency, plan_id, plan_name, billing_cycle, credits,
          status, subscription_start, subscription_end, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      `, [
        userId,
        firebaseUid,
        decodedToken.email,
        razorpay_order_id,
        razorpay_payment_id,
        planDetails.price,
        planDetails.currency || 'INR',
        planDetails.id,
        planDetails.name,
        planDetails.billingCycle,
        planDetails.credits,
        'completed',
        now,
        subscriptionEnd
      ]);

      return { userId };
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
