import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : undefined;
  initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    projectId: serviceAccount?.project_id, // <-- Explicitly set projectId
  });
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