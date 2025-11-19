const admin = require('firebase-admin');
const path = require('path');

// Adjust the path if your serviceAccountKey.json is elsewhere
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function removePdfFields() {
  const recipesRef = db.collection('recipes');
  const snapshot = await recipesRef.get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    if (doc.data().pdf) {
      await doc.ref.update({ pdf: admin.firestore.FieldValue.delete() });
      updated++;
      console.log(`Removed pdf field from recipe: ${doc.id}`);
    }
  }
  console.log(`Done. Removed pdf field from ${updated} recipes.`);
  process.exit(0);
}

removePdfFields().catch((err) => {
  console.error(err);
  process.exit(1);
});