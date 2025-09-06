const admin = require('firebase-admin');

// Use the relative path to your service account file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function findRecipesWithBothTrue() {
  const recipesRef = db.collection('recipes');
  const snapshot = await recipesRef.where('adjustable_servings', '==', true).get();

  let found = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.editable_ingredients === true) {
      found++;
      console.log(`Found: ${doc.id} | ${data.title || '(no title)'}`);
    }
  }
  console.log(`Total recipes with both adjustable_servings and editable_ingredients true: ${found}`);
}

findRecipesWithBothTrue().then(() => process.exit());