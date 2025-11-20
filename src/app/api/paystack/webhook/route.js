import { NextResponse } from 'next/server';
import path from 'path';
import admin from 'firebase-admin';
import crypto from 'crypto';

// Initialize Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

// Helper to parse paid_at safely
function parsePaidAt(data) {
  const paid_at = data.paid_at || data.paidAt || data.transaction_date || data.created_at;
  if (!paid_at) return admin.firestore.FieldValue.serverTimestamp();
  if (typeof paid_at === 'number') {
    return new Date(paid_at * 1000);
  }
  return new Date(paid_at);
}

export async function POST(req) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  // Compute hash
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  if (hash !== signature) {
    // Log error
    await db.collection('error_logs').add({
      error: 'Invalid signature',
      message: 'Webhook signature mismatch',
      details: { signature, hash },
      raw: body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch (err) {
    // Log error
    await db.collection('error_logs').add({
      error: 'Invalid JSON',
      message: err.message,
      details: {},
      raw: body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Log every webhook event
  await db.collection('paystack_webhook_logs').add({
    event: event.event || null,
    reference: event.data?.reference || null,
    status: event.data?.status || null,
    userId: event.data?.metadata?.uid || null,
    raw: event,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  if (event.event === 'charge.success') {
    const data = event.data;
    try {
      // Save or update payment record (deduplicated by reference)
      await db.collection('payments').doc(data.reference).set({
        uid: data.metadata?.uid || null,
        reference: data.reference,
        amount: data.amount / 100,
        currency: data.currency,
        channel: data.channel,
        status: data.status,
        paid_at: parsePaidAt(data),
        raw: data,
      }, { merge: true });

      // Optionally update user if you have uid in metadata
      if (data.metadata?.uid) {
        await db.collection('users').doc(data.metadata.uid).update({
          isPremium: true,
          premiumSince: admin.firestore.FieldValue.serverTimestamp(),
          premiumExpires: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
          lastPaymentRef: data.reference,
        });
      }
    } catch (err) {
      // Log error
      await db.collection('error_logs').add({
        error: 'Firestore write error',
        message: err.message,
        details: { event: event.event, reference: data.reference },
        raw: data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ error: 'Firestore error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}