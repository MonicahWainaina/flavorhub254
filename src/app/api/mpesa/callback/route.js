import { NextResponse } from 'next/server';
import { setPaymentStatus } from '../paymentStatus';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { initializeApp, applicationDefault } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  initializeApp({ credential: applicationDefault() });
  global._firebaseAdminInitialized = true;
}

export async function POST(req) {
  const body = await req.json();
  const callback = body.Body?.stkCallback;
  console.log('Raw callback body:', JSON.stringify(body, null, 2));
  console.log('CallbackMetadata:', JSON.stringify(callback?.CallbackMetadata, null, 2));

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
    console.error('Missing AccountReference in callback (even after fallback)');
    return NextResponse.json({ success: false, error: 'Missing AccountReference' }, { status: 400 });
  }

  console.log('Extracted accountRef:', accountRef);
  console.log('Extracted checkoutRequestID:', callback?.CheckoutRequestID);
  console.log('Extracted ResultCode:', callback?.ResultCode);

  const db = getFirestore();
  const paymentDoc = db.collection('mpesa_payments').doc(accountRef);
  const paymentSnap = await paymentDoc.get();

  console.log('Payment doc exists:', paymentSnap.exists);
  if (paymentSnap.exists) {
    console.log('Payment doc data:', paymentSnap.data());
  }

  if (paymentSnap.exists) {
    const paymentData = paymentSnap.data();
    // Idempotency: Only process if not already marked complete
    if (callback?.ResultCode === 0 && paymentData.status !== 'completed') {
      console.log('Updating payment and user for successful payment...');
      await paymentDoc.update({
        status: 'completed',
        completedAt: admin.firestore.Timestamp.now(),
        resultCode: callback?.ResultCode,
        resultDesc: callback?.ResultDesc,
        receipt,
      });

      if (paymentData.uid) {
        console.log('Updating user premium status for uid:', paymentData.uid);
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
      console.log('Marking payment as failed/canceled.');
      await paymentDoc.update({
        status: 'failed',
        resultCode: callback?.ResultCode,
        resultDesc: callback?.ResultDesc,
        completedAt: admin.firestore.Timestamp.now(),
      });
    }
  }

  // Log for debugging
  console.log('M-Pesa Callback:', {
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

  return NextResponse.json({ success: true });
}