import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  // Fallback checks for required environment variables
  const requiredVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY_ID',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_AUTH_URI',
    'GOOGLE_TOKEN_URI',
    'GOOGLE_AUTH_PROVIDER_X509_CERT_URL',
    'GOOGLE_CLIENT_X509_CERT_URL',
    'GOOGLE_UNIVERSE_DOMAIN',
  ];
  for (const key of requiredVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  // Build service account object
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

function generateAccountRef() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 5; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FH254-${ref}`;
}

export async function POST(req) {
  const { phone, amount = 1, uid, email } = await req.json();

  // Check if user is already premium
  const db = getFirestore();
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists && userDoc.data().isPremium) {
    return NextResponse.json(
      {
        success: false,
        message: 'You are already a premium user. No need to pay again.',
      },
      { status: 400 }
    );
  }

  // Get access token
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const tokenRes = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      method: 'GET',
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  const { access_token } = await tokenRes.json();

  // Prepare STK Push payload
  const BusinessShortCode = '174379'; // Sandbox paybill
  const Passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2c2c49c5b1b7b7b7b7b7b7b7b7';
  const TimestampStr = new Date()
    .toISOString()
    .replace(/[-T:\.Z]/g, '')
    .slice(0, 14);
  const Password = Buffer.from(
    BusinessShortCode + Passkey + TimestampStr
  ).toString('base64');

  const AccountReference = generateAccountRef();
  const CallbackURL = process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback';

  const payload = {
    BusinessShortCode,
    Password,
    Timestamp: TimestampStr,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: BusinessShortCode,
    PhoneNumber: phone,
    CallBackURL: CallbackURL,
    AccountReference,
    TransactionDesc: 'FlavorHUB254 Premium Subscription',
  };

  // Call STK Push API
  const stkRes = await fetch(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const stkData = await stkRes.json();

  // Save mapping in Firestore (include checkoutRequestID for fallback)
  await db.collection('mpesa_payments').doc(AccountReference).set({
    accountRef: AccountReference,
    uid,
    email,
    phone,
    amount,
    initiatedAt: admin.firestore.Timestamp.now(),
    status: 'initiated',
    checkoutRequestID: stkData.CheckoutRequestID || null,
  });

  // Return result to frontend
  if (stkData.ResponseCode === '0') {
    return NextResponse.json({
      success: true,
      message: 'STK Push initiated. Check your phone to complete payment.',
      accountRef: AccountReference,
      checkoutRequestID: stkData.CheckoutRequestID,
      data: stkData,
    });
  } else {
    return NextResponse.json({
      success: false,
      message: stkData.errorMessage || 'Failed to initiate payment.',
      data: stkData,
    });
  }
}
