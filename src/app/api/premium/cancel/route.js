import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

if (!global._firebaseAdminInitialized) {
  let privateKey;

  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    try {
      let decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
      // Remove any leading/trailing whitespace/newlines
      decoded = decoded.trim();
      // If the decoded string does NOT start with '-----BEGIN PRIVATE KEY-----', add it
      if (!decoded.startsWith('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${decoded}\n-----END PRIVATE KEY-----`;
      } else {
        privateKey = decoded;
      }
    } catch (e) {
      throw new Error("Failed to decode FIREBASE_PRIVATE_KEY_BASE64: " + e.message);
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
    private_key: privateKey,
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