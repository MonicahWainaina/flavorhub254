import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  let serviceAccount;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      // Replace all \\n with actual newlines
      const cleanString = serviceAccountJson.replace(/\\n/g, '\n');
      serviceAccount = JSON.parse(cleanString);
      // Remove any carriage returns in the private key
      serviceAccount.private_key = serviceAccount.private_key.replace(/\r/g, '');
    } catch (e) {
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${e.message}`);
    }
  } else {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.");
  }

  initializeApp({ credential: cert(serviceAccount), projectId: serviceAccount.project_id });
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