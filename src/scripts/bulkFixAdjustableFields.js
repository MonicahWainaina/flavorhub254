const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 🍲 Recipes: adjustable_servings = true, editable_ingredients = false
const scalableByServing = [
  "Mac & Cheese (Baked)",
  "Lasagne (Beef or Veg)",
  "Beef Pilau – Kenyan Spiced Rice",
  "Cauliflower Fried Rice",
  "Homemade Pizza (Cheese & Beef)",
  "Chicken Biryani – One Pot",
  "Coconut Chicken & Rice – One Pot",
  "Coconut Curry Lentil Soup",
  "Coconut Ndengu Stew",
  "Creamy Chicken Pasta – One Pot",
  "Curried Pumpkin Soup",
  "Egg Fried Rice – One Pot",
  "Githeri – Kenyan Maize and Beans Stew",
  "Lentil Bolognese",
  "Minji & Potato Stew",
  "One Pot Rice & Beans",
  "One Pot Rice and Beans",
  "One Pot Spaghetti Bolognese",
  "Vegan Pesto Pasta",
  "Vegetable Spring Rolls",
  "Vegetable Biryani",
  "Vegetable Fried Rice – One Pot"
];

// 🎂 Recipes: editable_ingredients = true, adjustable_servings = false
const editableFlourAnchor = [
  "Chocolate Mug Cake",
  "Classic Cinnamon Rolls"
];

async function fixRecipes() {
  const recipesRef = db.collection('recipes');
  const snapshot = await recipesRef.get();

  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (scalableByServing.includes(data.title)) {
      await doc.ref.update({
        adjustable_servings: true,
        editable_ingredients: false
      });
      console.log(`🍲 Updated: ${data.title}`);
      updated++;
    } else if (editableFlourAnchor.includes(data.title)) {
      await doc.ref.update({
        editable_ingredients: true,
        adjustable_servings: false
      });
      console.log(`🎂 Updated: ${data.title}`);
      updated++;
    }
  }
  console.log(`Total recipes updated: ${updated}`);
}

// Helper: Print all recipe titles and slugs for easier matching
async function printAllTitlesAndSlugs() {
  const recipesRef = db.collection('recipes');
  const snapshot = await recipesRef.get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Title: ${data.title} | Slug: ${data.slug}`);
  });
}

// --- Uncomment ONE of the following lines depending on your need ---

// To update recipes in Firestore:
 fixRecipes().then(() => process.exit());

// To print all titles and slugs for reference:
// printAllTitlesAndSlugs().then(() => process.exit());