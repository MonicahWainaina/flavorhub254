const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const OpenAI = require('openai');
const fs = require('fs');

// --- CONFIGURATION ---
const FIREBASE_BUCKET = process.env.FIREBASE_BUCKET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// --- INIT FIREBASE ADMIN ---
initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
  storageBucket: FIREBASE_BUCKET,
});
const db = getFirestore();
const bucket = getStorage().bucket();

// --- INIT OPENAI ---
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- HELPER: Build narration string ---
function buildNarration(recipe) {
  let narration = `${recipe.title}.\n${recipe.description || ''}\n\nIngredients:\n`;
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    narration += recipe.ingredients.map(i =>
      typeof i === 'string'
        ? i
        : `${i.amount || ''} ${i.unit || ''} ${i.name || ''}`.trim()
    ).join('\n');
  }
  narration += '\n\nInstructions:\n';
  if (recipe.instructions && recipe.instructions.length > 0) {
    narration += recipe.instructions.map((step, idx) => `Step ${idx + 1}: ${step}`).join('\n');
  }
  return narration;
}

// --- MAIN SCRIPT ---
async function processRecipeDoc(doc) {
  const recipe = doc.data();
  // Only skip if mp3_url is already a Firebase Storage URL
  if (
    recipe.audio &&
    recipe.audio.mp3_url &&
    recipe.audio.mp3_url.startsWith('https://storage.googleapis.com/')
  ) {
    console.log(`Skipping ${recipe.title} (already has Firebase audio.mp3_url)`);
    return;
  }

  // --- Check if bucket is accessible before calling OpenAI ---
  try {
    await bucket.getFiles({ maxResults: 1 });
  } catch (err) {
    console.error(`Storage bucket not accessible for ${recipe.title}:`, err.message);
    return; // Do not proceed to OpenAI call
  }

  const narration = buildNarration(recipe);
  console.log(`Narration length for ${recipe.title}: ${narration.length} characters`);

  // --- Generate MP3 with OpenAI ---
  console.log(`Generating audio for: ${recipe.title}`);
  let response;
  try {
    response = await openai.audio.speech.create({
      model: "tts-1-hd",
      input: narration,
      voice: "alloy",
      response_format: "mp3",
    });
  } catch (err) {
    console.error(`OpenAI TTS failed for ${recipe.title}:`, err.message);
    return;
  }

  // --- Save MP3 locally ---
  const mp3Buffer = Buffer.from(await response.arrayBuffer());
  const mp3FileName = `${recipe.slug}.mp3`;
  const localMp3Path = path.join(__dirname, mp3FileName);
  fs.writeFileSync(localMp3Path, mp3Buffer);

  // --- Upload to Firebase Storage ---
  const storagePath = `recipe-audio/${mp3FileName}`;
  try {
    await bucket.upload(localMp3Path, {
      destination: storagePath,
      public: true,
      metadata: {
        contentType: 'audio/mpeg',
      },
    });
  } catch (err) {
    console.error(`Failed to upload audio for ${recipe.title}:`, err.message);
    fs.unlinkSync(localMp3Path); // Clean up
    return; // Do not update Firestore if upload fails
  }
  const audioUrl = `https://storage.googleapis.com/${FIREBASE_BUCKET}/${storagePath}`;
  console.log(`Uploaded audio for ${recipe.title}: ${audioUrl}`);

  // --- Update Firestore doc ---
  try {
    await doc.ref.update({
      audio: {
        ...(recipe.audio || {}),
        has_audio_instruction: true,
        mp3_url: audioUrl,
      },
    });
  } catch (err) {
    console.error(`Failed to update Firestore for ${recipe.title}:`, err.message);
    // Optionally: delete the uploaded file if Firestore update fails
    await bucket.file(storagePath).delete().catch(() => {});
  }

  // --- Clean up local MP3 ---
  fs.unlinkSync(localMp3Path);
}

async function main() {
  // Remove the slugsToTest filter to process all recipes
  const snapshot = await db.collection('recipes').get();

  for (const doc of snapshot.docs) {
    try {
      await processRecipeDoc(doc);
    } catch (err) {
      console.error(`Error processing ${doc.id}:`, err.message);
    }
  }
  console.log('Done!');
}

main();