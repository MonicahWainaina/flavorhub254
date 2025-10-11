import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  let serviceAccount;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${e.message}`);
    }
  } else {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
  }

  initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
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