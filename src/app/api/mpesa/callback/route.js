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
  const raw = await req.text();
  console.log("RAW BODY:", raw);
  if (!raw) {
    return NextResponse.json({ success: false, message: "Empty body" }, { status: 400 });
  }

  let body;
  try {
    body = JSON.parse(raw);
  } catch (e) {
    return NextResponse.json({ success: false, message: "Malformed JSON body" }, { status: 400 });
  }

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