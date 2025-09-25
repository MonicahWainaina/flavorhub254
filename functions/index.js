/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const puppeteer = require('puppeteer');

admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.generateRecipePDF = functions.https.onCall(async (data, context) => {
  // 1. Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }
  const uid = context.auth.uid;

  // 2. Download limit check (Firestore)
  const today = new Date().toISOString().slice(0, 10);
  const userRef = admin.firestore().collection('users').doc(uid);
  const downloadsRef = userRef.collection('pdfDownloads').doc(today);
  const docSnap = await downloadsRef.get();
  const count = docSnap.exists ? docSnap.data().count : 0;
  if (count >= 3) {
    throw new functions.https.HttpsError('permission-denied', 'Download limit reached');
  }

  // 3. Render PDF with Puppeteer
  const recipeId = data.recipeId;
  const recipeUrl = `https://your-domain.com/recipe/${recipeId}?pdf=1`; // Update with your deployed URL
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(recipeUrl, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  // 4. Increment download count
  await downloadsRef.set({ count: count + 1 }, { merge: true });

  // 5. Return PDF as base64
  return { pdf: pdfBuffer.toString('base64') };
});
