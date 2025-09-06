const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function findRecipesWithBothFalse() {
  const recipesRef = db.collection('recipes');
  const snapshot = await recipesRef.get();

  let found = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.adjustable_servings === false && data.editable_ingredients === false) {
      found++;
      console.log(`Found: ${doc.id} | ${data.title || '(no title)'}`);
    }
  }
  console.log(`Total recipes with both adjustable_servings and editable_ingredients false: ${found}`);
}

findRecipesWithBothFalse().then(() => process.exit());