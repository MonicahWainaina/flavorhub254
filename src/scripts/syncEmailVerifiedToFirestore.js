/**
 * Syncs emailVerified status from Firebase Auth to Firestore users collection.
 * Run with: node scripts/syncEmailVerifiedToFirestore.js
 */

const { initializeApp, applicationDefault, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json"); // Update path if needed

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

async function syncEmailVerified() {
  let nextPageToken;
  let updated = 0;
  let checked = 0;

  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    for (const userRecord of listUsersResult.users) {
      checked++;
      const { uid, emailVerified } = userRecord;
      const userDocRef = db.collection("users").doc(uid);
      const userDoc = await userDocRef.get();
      if (userDoc.exists) {
        await userDocRef.update({ emailVerified });
        updated++;
        console.log(`Updated ${uid}: emailVerified=${emailVerified}`);
      } else {
        console.log(`Skipped ${uid}: user doc does not exist`);
      }
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  console.log(`\nChecked: ${checked} users`);
  console.log(`Updated: ${updated} Firestore user docs`);
}

syncEmailVerified()
  .then(() => {
    console.log("Sync complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error syncing emailVerified:", err);
    process.exit(1);
  });