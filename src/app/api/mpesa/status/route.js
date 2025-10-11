import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  let serviceAccount;
  try {
    serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
      : undefined;
  } catch (e) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e);
    serviceAccount = undefined;
  }
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId: serviceAccount?.project_id,
  });
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