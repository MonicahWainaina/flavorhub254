import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import admin from 'firebase-admin';

if (!global._firebaseAdminInitialized) {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  initializeApp({ credential: cert(serviceAccount) });
  global._firebaseAdminInitialized = true;
}

export async function POST(req) {
  const body = await req.json();
  setPaymentStatus(body);
  return Response.json({ success: true });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const accountRef = searchParams.get('accountRef');
  if (!accountRef) {
    return NextResponse.json({ error: 'Missing accountRef' }, { status: 400 });
  }
  const db = getFirestore();
  const paymentDoc = await db.collection('mpesa_payments').doc(accountRef).get();
  if (!paymentDoc.exists) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }
  const payment = paymentDoc.data();
  return NextResponse.json({
    resultCode: payment.resultCode,
    resultDesc: payment.resultDesc,
    status: payment.status,
  });
}