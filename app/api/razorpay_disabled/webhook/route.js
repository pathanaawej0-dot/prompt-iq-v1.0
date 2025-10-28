import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity, event.payload.payment.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment) {
  try {
    // Log successful payment
    await adminDb.collection('webhook_logs').add({
      event: 'payment.captured',
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      createdAt: new Date(),
    });

    console.log('Payment captured:', payment.id);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    // Log failed payment
    await adminDb.collection('webhook_logs').add({
      event: 'payment.failed',
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
      errorCode: payment.error_code,
      errorDescription: payment.error_description,
      createdAt: new Date(),
    });

    console.log('Payment failed:', payment.id);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSubscriptionCharged(subscription, payment) {
  try {
    // Handle recurring subscription charges
    await adminDb.collection('webhook_logs').add({
      event: 'subscription.charged',
      subscriptionId: subscription.id,
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.status,
      createdAt: new Date(),
    });

    console.log('Subscription charged:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription charged:', error);
  }
}
