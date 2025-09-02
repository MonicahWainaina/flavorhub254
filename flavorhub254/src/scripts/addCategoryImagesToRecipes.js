const fs = require("fs");
const path = require("path");

// Set your recipes directory
const RECIPES_DIR = path.join(__dirname, "recipes");

// Map each category to a default Cloudinary image URL
const CATEGORY_IMAGES = {
  "Breakfast":      { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777103/recipe/breakfast_qah5se.png", alt: "Breakfast recipes" },
  "Vegetarian":     { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777246/recipe/vegeterian_rrldtz.png", alt: "Vegetarian recipes" },
  "Fried Foods":    { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755778571/recipe/friedfoods_vzurws.png", alt: "Fried foods" },
  "Guilty Pleasures": { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777085/recipe/guilty_pleasures_tz38ie.png", alt: "Guilty pleasures" },
  "Kenyan Classics":  { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777091/recipe/kenyan_classics_u7hww0.png", alt: "Kenyan classics" },
  "One Pot Meals":    { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777171/recipe/onepot_meals_tuyv38.png", alt: "One pot meals" },
  "Stew & Curries":   { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777070/recipe/stews_curries_jksa9a.jpg", alt: "Stew and curries" },
  "Sweet Treats":     { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777167/recipe/sweet_treats_mojait.png", alt: "Sweet treats" },
  "Airfyer Recipes":  { url: "https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777002/recipe/Airfryer_hgt5vl.png", alt: "Airfryer recipes" },
};

// Fallback image if category not found
const FALLBACK_IMAGE = { url: "https://res.cloudinary.com/your-cloud/image/upload/v1/recipes/default.jpg", alt: "Recipe image" };

function addCategoryImageToRecipeFile(filePath, category) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  let changed = false;

  const image = CATEGORY_IMAGES[category] || FALLBACK_IMAGE;

  // Always overwrite the image field
  data.image = image;
  changed = true;

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated image: ${filePath} (${category})`);
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
          addCategoryImageToRecipeFile(filePath, category);
        }
      }
    }
  }
  console.log("✅ All recipes updated with category-based images!");
}

processAllRecipes();