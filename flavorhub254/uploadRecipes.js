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
const RECIPES_DIR = path.join(__dirname, "recipes");

async function uploadRecipes() {
  const categories = fs.readdirSync(RECIPES_DIR);

  for (const category of categories) {
    const categoryPath = path.join(RECIPES_DIR, category);

    if (fs.lstatSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath);

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(categoryPath, file);
          const recipeData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

          // Add category field
          recipeData.category = category;

          // Use filename (without .json) as document ID
          const docId = path.basename(file, ".json");

          // Upload to Firestore
          const docRef = db.collection("recipes").doc(docId);
          await docRef.set(recipeData);

          console.log(`Uploaded: ${file} under ${category} as ${docId}`);
        }
      }
    }
  }

  console.log("✅ All recipes uploaded!");
}

uploadRecipes().catch(console.error);