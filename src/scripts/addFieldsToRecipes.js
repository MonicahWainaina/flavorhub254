const fs = require("fs");
const path = require("path");

// Set your recipes directory
const RECIPES_DIR = path.join(__dirname, "recipes");

// Customize your defaults per category
const CATEGORY_DEFAULTS = {
  "Breakfast":      { rating: 4.8, time: 15 },
  "Vegetarian":     { rating: 4.7, time: 30 },
  "Fried Foods":    { rating: 4.5, time: 25 },
  "Guilty Pleasures": { rating: 4.6, time: 40 },
  "Kenyan Classics":  { rating: 4.9, time: 35 },
  "One Pot Meals":    { rating: 4.7, time: 45 },
  "Stew & Curries":   { rating: 4.8, time: 50 },
  "Sweet Treats":     { rating: 4.9, time: 20 },
  "Airfyer Recipes":  { rating: 4.6, time: 25 },
  // Add more categories as needed
};

// Fallback defaults if category not found
const FALLBACK = { rating: 4.5, time: 30 };

function addFieldsToRecipeFile(filePath, category) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  const defaults = CATEGORY_DEFAULTS[category] || FALLBACK;

  if (typeof data.rating === "undefined" || data.rating === null) {
    data.rating = defaults.rating;
    changed = true;
  }
  if (typeof data.time === "undefined" || data.time === null) {
    data.time = defaults.time;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated: ${filePath} (${category})`);
  }
}

function processAllRecipes() {
  const categories = fs.readdirSync(RECIPES_DIR);

  for (const category of categories) {
    const categoryPath = path.join(RECIPES_DIR, category);
    if (fs.lstatSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(categoryPath, file);
          addFieldsToRecipeFile(filePath, category);
        }
      }
    }
  }
  console.log("✅ All recipes updated with category-based rating and time!");
}

processAllRecipes();