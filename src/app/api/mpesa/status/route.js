import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
  };
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