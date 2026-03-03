const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Load Firebase service account
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Path to your recipe folder
const RECIPES_DIR = path.join(__dirname, "../../recipes");

async function patchRecipeIds() {
  const files = fs.readdirSync(RECIPES_DIR);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const docId = path.basename(file, ".json");
      const docRef = db.collection("recipes").doc(docId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        await docRef.update({ id: docId });
        console.log(`Patched id for: ${docId}`);
      } else {
        console.log(`Skipped (not found): ${docId}`);
      }
    }
  }
  console.log("✅ Finished patching new recipe ids!");
}

patchRecipeIds().catch(console.error);