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

// Path to your recipe folders
const RECIPES_DIR = path.join(__dirname, "../../recipes");

async function uploadRecipes() {
  const files = fs.readdirSync(RECIPES_DIR);

  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(RECIPES_DIR, file);
      const recipeData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Optionally, set a default category or leave as is
      // recipeData.category = "Uncategorized";

      // Use filename (without .json) as document ID
      const docId = path.basename(file, ".json");

      // Upload to Firestore
      const docRef = db.collection("recipes").doc(docId);
      await docRef.set(recipeData);

      console.log(`Uploaded: ${file} as ${docId}`);
    }
  }

  console.log("✅ All recipes uploaded!");
}

uploadRecipes().catch(console.error);