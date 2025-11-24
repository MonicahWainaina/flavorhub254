const admin = require('firebase-admin');

// Build service account object from environment variables
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function downgradeExpiredPremiums() {
  const now = new Date();
  const usersRef = db.collection('users');
  const snapshot = await usersRef
    .where('isPremium', '==', true)
    .where('premiumExpires', '<', admin.firestore.Timestamp.fromDate(now))
    .get();

  if (snapshot.empty) {
    console.log('No expired premium users found.');
    return;
  }

  for (const docSnap of snapshot.docs) {
    await docSnap.ref.update({
      isPremium: false,
    });
    console.log(`Downgraded user: ${docSnap.id}`);
  }
}

downgradeExpiredPremiums().then(() => {
  console.log('Done.');
  process.exit(0);
});