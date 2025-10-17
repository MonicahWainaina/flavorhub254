import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { Redis } from '@upstash/redis';


if (!global._firebaseAdminInitialized) {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  initializeApp({ credential: cert(serviceAccount) });
  global._firebaseAdminInitialized = true;
}

// --- Upstash Redis rate limiting setup ---
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
const LIMIT = 3; // 3 requests per hour per user/IP
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds

function getClientIp(req) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
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

  const { phone, amount = 1, uid, email } = body;

  // --- Rate limiting ---
  const ip = getClientIp(req);
  const key = uid ? `mpesa:initiate:${uid}` : `mpesa:initiate:guest:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW);
  }
  if (current > LIMIT) {
    return NextResponse.json(
      { success: false, message: "Rate limit exceeded. Please wait before trying again." },
      { status: 429 }
    );
  }

  // Check if user is already premium
  const db = getFirestore();
  const userDoc = await db.collection('users').doc(uid).get();
  if (userDoc.exists && userDoc.data().isPremium) {
    return NextResponse.json(
      {
        success: false,
        message: 'You are already a premium user',
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

  // Defensive: Check if tokenRes is ok and has a body
  if (!tokenRes.ok) {
    return NextResponse.json({ success: false, message: "Failed to get Mpesa access token" }, { status: 500 });
  }
  const tokenText = await tokenRes.text();
  if (!tokenText) {
    return NextResponse.json({ success: false, message: "Mpesa token response was empty" }, { status: 500 });
  }
  let access_token;
  try {
    access_token = JSON.parse(tokenText).access_token;
  } catch (e) {
    return NextResponse.json({ success: false, message: "Malformed Mpesa token response" }, { status: 500 });
  }

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

  // Defensive: Check if stkRes is ok and has a body
  if (!stkRes.ok) {
    return NextResponse.json({ success: false, message: "Failed to initiate STK Push" }, { status: 500 });
  }
  const stkText = await stkRes.text();
  if (!stkText) {
    return NextResponse.json({ success: false, message: "STK Push response was empty" }, { status: 500 });
  }
  let stkData;
  try {
    stkData = JSON.parse(stkText);
  } catch (e) {
    return NextResponse.json({ success: false, message: "Malformed STK Push response" }, { status: 500 });
  }

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
