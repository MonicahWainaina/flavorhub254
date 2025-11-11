const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // path to your service account

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