/**
 * Run this script with: node src/scripts/addCategories.js
 * Make sure you have your Firebase Admin SDK credentials set up.
 */

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

// Define your categories here
const categories = [
  {
    id: 'Kenyan Classics',
    title: 'Kenyan Classics',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777091/recipe/kenyan_classics_u7hww0.png',
    description: 'Traditional Kenyan favorites',
    order: 1,
  },
  {
    id: 'Airfyer Recipes',
    title: 'Airfyer Recipes',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777002/recipe/Airfryer_hgt5vl.png',
    description: 'Airfryer favorites',
    order: 2,
  },
  {
    id: 'Breakfast',
    title: 'Breakfast',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777103/recipe/breakfast_qah5se.png',
    description: 'Start your day right',
    order: 3,
  },
  {
    id: 'Vegetarian',
    title: 'Vegetarian',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777246/recipe/vegeterian_rrldtz.png',
    description: 'Meat-free delights',
    order: 4,
  },
  {
    id: 'Fried Foods',
    title: 'Fried Foods',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755778571/recipe/friedfoods_vzurws.png',
    description: 'Crispy and golden',
    order: 5,
  },
  {
    id: 'Guilty Pleasures',
    title: 'Guilty Pleasures',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777085/recipe/guilty_pleasures_tz38ie.png',
    description: 'Indulgent treats',
    order: 6,
  },
  {
    id: 'One Pot Meals',
    title: 'One Pot Meals',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777171/recipe/onepot_meals_tuyv38.png',
    description: 'Easy one-pot wonders',
    order: 7,
  },
  {
    id: 'Stew & Curries',
    title: 'Stew & Curries',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777070/recipe/stews_curries_jksa9a.jpg',
    description: 'Warm and hearty',
    order: 8,
  },
  {
    id: 'Sweet Treats',
    title: 'Sweet Treats',
    imageUrl: 'https://res.cloudinary.com/djlcnpdtn/image/upload/v1755777167/recipe/sweet_treats_mojait.png',
    description: 'Desserts and bakes',
    order: 9,
  },
];

async function addCategories() {
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set(cat);
    console.log(`Added/updated category: ${cat.title}`);
  }
  console.log('All categories added/updated!');
  process.exit(0);
}

addCategories().catch((err) => {
  console.error('Error adding categories:', err);
  process.exit(1);
});