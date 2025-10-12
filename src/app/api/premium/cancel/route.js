import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import admin from 'firebase-admin';

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
  const { uid } = await req.json();
  if (!uid) {
    return NextResponse.json({ success: false, message: 'Missing user ID.' }, { status: 400 });
  }
  const db = getFirestore();
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