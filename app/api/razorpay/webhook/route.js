import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '../../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });

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
    console.log('Payment captured:', payment.id);
    
    // Update transaction status
    const transactionsQuery = await adminDb
      .collection('transactions')
      .where('paymentId', '==', payment.id)
      .get();

    if (!transactionsQuery.empty) {
      const transactionDoc = transactionsQuery.docs[0];
      await transactionDoc.ref.update({
        status: 'captured',
        capturedAt: new Date().toISOString(),
        webhookProcessed: true
      });
    }

    // Log webhook event
    await adminDb.collection('webhook_events').add({
      event: 'payment.captured',
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    console.log('Payment failed:', payment.id);
    
    // Update order status to failed
    if (payment.order_id) {
      await adminDb.collection('orders').doc(payment.order_id).update({
        status: 'failed',
        failureReason: payment.error_description || 'Payment failed',
        failedAt: new Date().toISOString()
      });
    }

    // Log failed transaction
    await adminDb.collection('transactions').add({
      paymentId: payment.id,
      orderId: payment.order_id,
      status: 'failed',
      error: payment.error_description || 'Payment failed',
      amount: payment.amount,
      createdAt: new Date().toISOString(),
      type: 'webhook_failure'
    });

    // Log webhook event
    await adminDb.collection('webhook_events').add({
      event: 'payment.failed',
      paymentId: payment.id,
      orderId: payment.order_id,
      error: payment.error_description,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(order) {
  try {
    console.log('Order paid:', order.id);
    
    // Update order status
    await adminDb.collection('orders').doc(order.id).update({
      status: 'paid',
      paidAt: new Date().toISOString(),
      webhookProcessed: true
    });

    // Log webhook event
    await adminDb.collection('webhook_events').add({
      event: 'order.paid',
      orderId: order.id,
      amount: order.amount,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}
