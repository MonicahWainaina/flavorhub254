import { NextResponse } from 'next/server';
import { setPaymentStatus } from '../paymentStatus';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  let privateKey;
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    try {
      privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8').trim();
    } catch (e) {
      throw new Error("Failed to decode FIREBASE_PRIVATE_KEY_BASE64");
    }
  } else if (process.env.GOOGLE_PRIVATE_KEY) {
    privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').trim();
  } else {
    throw new Error("Missing private key environment variable");
  }

  const requiredVars = [
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY_ID',
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

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: privateKey, // <-- correct usage!
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
  const callback = body.Body?.stkCallback;


  // Flexible extraction for AccountReference and other metadata
  let accountRef, amount, receipt, phone;
  if (Array.isArray(callback?.CallbackMetadata)) {
    accountRef = callback.CallbackMetadata.find(i => i.Name === 'AccountReference')?.Value;
    amount = callback.CallbackMetadata.find(i => i.Name === 'Amount')?.Value;
    receipt = callback.CallbackMetadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    phone = callback.CallbackMetadata.find(i => i.Name === 'PhoneNumber')?.Value;
  } else if (Array.isArray(callback?.CallbackMetadata?.Item)) {
    accountRef = callback.CallbackMetadata.Item.find(i => i.Name === 'AccountReference')?.Value;
    amount = callback.CallbackMetadata.Item.find(i => i.Name === 'Amount')?.Value;
    receipt = callback.CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    phone = callback.CallbackMetadata.Item.find(i => i.Name === 'PhoneNumber')?.Value;
  }

  // Fallback: If AccountReference is missing, look up by CheckoutRequestID
  if (!accountRef && callback?.CheckoutRequestID) {
    const db = getFirestore();
    const paymentSnap = await db.collection('mpesa_payments')
      .where('checkoutRequestID', '==', callback.CheckoutRequestID)
      .limit(1)
      .get();
    if (!paymentSnap.empty) {
      accountRef = paymentSnap.docs[0].data().accountRef;
    }
  }

  setPaymentStatus({
    resultCode: callback?.ResultCode,
    resultDesc: callback?.ResultDesc,
    merchantRequestID: callback?.MerchantRequestID,
    checkoutRequestID: callback?.CheckoutRequestID,
    amount,
    receipt,
    phone,
    accountRef,
    raw: body,
  });

  // Guard for missing accountRef (after fallback)
  if (!accountRef) {
    return NextResponse.json({ success: false, error: 'Missing AccountReference' }, { status: 400 });
  }

 

  const db = getFirestore();
  const paymentDoc = db.collection('mpesa_payments').doc(accountRef);
  const paymentSnap = await paymentDoc.get();


  if (paymentSnap.exists) {
    const paymentData = paymentSnap.data();
    // Idempotency: Only process if not already marked complete
    if (callback?.ResultCode === 0 && paymentData.status !== 'completed') {
      await paymentDoc.update({
        status: 'completed',
        completedAt: admin.firestore.Timestamp.now(),
        resultCode: callback?.ResultCode,
        resultDesc: callback?.ResultDesc,
        receipt,
      });

      if (paymentData.uid) {
        await db.collection('users').doc(paymentData.uid).set(
          {
            isPremium: true,
            premiumSince: admin.firestore.Timestamp.now(),
            premiumExpires: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            lastPaymentRef: accountRef,
          },
          { merge: true }
        );
      }
    } else if (paymentData.status !== 'failed') {
      await paymentDoc.update({
        status: 'failed',
        resultCode: callback?.ResultCode,
        resultDesc: callback?.ResultDesc,
        completedAt: admin.firestore.Timestamp.now(),
      });
    }
  }

  return NextResponse.json({ success: true });
}