import { NextResponse } from 'next/server';
import { setPaymentStatus } from '../paymentStatus';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';


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
  // --- Safaricom IP Whitelist ---
  const allowedIps = [
    "196.201.214.200",
    "196.201.214.206",
    "196.201.213.114",
    "196.201.214.207",
    "196.201.214.208",
    "196.201.213.44",
    "196.201.212.127",
    "196.201.212.138",
    "196.201.212.129",
    "196.201.212.136",
    "196.201.212.74",
    "196.201.212.69"
  ];
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!allowedIps.includes(ip)) {
    console.warn(`[SECURITY] Blocked callback from IP: ${ip} at ${new Date().toISOString()}`);
    return NextResponse.json({ success: false, error: "Unauthorized source IP" }, { status: 403 });
  }

  // --- Parse and validate body ---
  const raw = await req.text();
  if (!raw) {
    console.warn(`[SECURITY] Empty callback body from IP: ${ip} at ${new Date().toISOString()}`);
    return NextResponse.json({ success: false, message: "Empty body" }, { status: 400 });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    console.warn(`[SECURITY] Malformed JSON body from IP: ${ip} at ${new Date().toISOString()}`);
    return NextResponse.json({ success: false, message: "Malformed JSON body" }, { status: 400 });
  }

  const callback = body.Body?.stkCallback;

  // --- Validate required callback fields ---
  if (
    typeof callback?.ResultCode !== "number" ||
    !callback?.CheckoutRequestID ||
    !callback?.CallbackMetadata
  ) {
    console.warn(`[SECURITY] Malformed callback payload from IP: ${ip} at ${new Date().toISOString()}`);
    return NextResponse.json({ success: false, error: "Malformed callback payload" }, { status: 400 });
  }

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
    console.warn(`[SECURITY] Missing AccountReference for callback from IP: ${ip} at ${new Date().toISOString()}`);
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