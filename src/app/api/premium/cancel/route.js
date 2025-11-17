import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

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

  const { uid } = body;
  if (!uid) {
    return NextResponse.json({ success: false, message: 'Missing user ID.' }, { status: 400 });
  }
  try {
    await db.collection('users').doc(uid).update({
      isPremium: false,
      premiumExpires: null,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to cancel subscription.' }, { status: 500 });
  }
}