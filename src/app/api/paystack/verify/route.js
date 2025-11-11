import { NextResponse } from 'next/server';
import path from 'path';
import admin from 'firebase-admin';

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
  const { reference, uid } = await req.json();

  // Verify payment with Paystack
  const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers:
      {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
  });
  const data = await resp.json();

  if (data.status && data.data.status === 'success') {
    // Save or update payment record (deduplicated by reference)
    await db.collection('payments').doc(reference).set({
      uid,
      reference,
      amount: data.data.amount / 100,
      currency: data.data.currency,
      channel: data.data.channel,
      status: data.data.status,
      paid_at: parsePaidAt(data.data),
      raw: data.data,
    }, { merge: true });

    // Update Firestore user with premiumExpires
    await db.collection('users').doc(uid).update({
      isPremium: true,
      premiumSince: admin.firestore.FieldValue.serverTimestamp(),
      premiumExpires: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      lastPaymentRef: reference,
    });
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, message: 'Payment not verified' }, { status: 400 });
  }
}