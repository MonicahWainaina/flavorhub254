# flavorHUB254 – Kenya’s Smart Recipe Library  

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://flavorhub254.vercel.app)
[![CI](https://github.com/MonicahWainaina/flavorhub254/actions/workflows/ci.yml/badge.svg)](https://github.com/MonicahWainaina/flavorhub254/actions)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)

Welcome to **flavorHUB254**, a modern recipe web app built with Next.js, Firebase, and React.  
Discover, browse, and save your favourite Kenyan and global recipes — all in one place.  
MVP features are complete and Post-MVP work (audio, Smart Cooking, FlavorBot) is now in progress.

---

## 👩🏾‍🍳 Author  

Monicah Wainaina  

---

## 🖥️ User Interface  

Here are some snapshots of the app’s interface:

| Home Page | Browse Recipes | Recipe Details |
|-----------|----------------|----------------|
| ![Home](https://res.cloudinary.com/djlcnpdtn/image/upload/v1757619486/recipe/Homepage.png) | ![Browse](https://res.cloudinary.com/djlcnpdtn/image/upload/v1756908810/recipe/Browse.png) | ![Recipe](https://res.cloudinary.com/djlcnpdtn/image/upload/v1756908449/recipe/Recipepage.png) |


---

## ✨ Current Features (MVP Complete)

- **User Authentication:** Secure login and sign-up with Firebase Auth.
- **Browse & Filter Recipes:** Explore recipes by category, ingredient, or search.
- **Favorites:** Save and manage your favourite recipes (requires login).
- **Serving Adjustment:** Scale ingredient quantities for different servings.
- **Responsive Design:** Works on mobile, tablet, and desktop.
- **Firebase Integration:** Recipes and favourites stored securely.
- **Email Verification:** Users must verify their email to access premium features.
- **Rate Limiting:** API endpoints (e.g., FlavorBot) are protected against abuse.
- **Content Security Policy:** CSP headers added for improved security.
- **Legal Docs:** Privacy Policy and Terms of Service available and linked in the UI.

---

## 🚀 Premium Features (Post-MVP Complete)

- **Downloadable Audio Instructions** (MP3 per recipe).
- **Smart Cooking Mode**: Step-by-step, timer-enabled, with optional browser-based narration.
- **FlavorBot (AI Assistant)**: Ask questions about food, cooking, and recipes.
- **Premium Features**: Audio, Smart Cooking, and PDF downloads for premium users.
- **MFA (2FA):** Planned for future security enhancement.

---

## 🛠️ Technologies Used  

- **Next.js** (React framework)  
- **Firebase** (Firestore & Auth)  
- **React** (UI library)  
- **Tailwind CSS** (styling)  
- **Jest** (testing)  
- **Vercel** (hosting & CI/CD)  
- **Upstash Redis** (API rate limiting)  
- **OpenAI API** (AI features)  

---

## 🔒 Security & Infrastructure

- **Email Verification:** Enforced before premium access.
- **Rate Limiting:** Upstash Redis protects API endpoints from abuse.
- **CSP Headers:** Content Security Policy set in Next.js config.
- **Dependency Audits:** Regular `npm audit fix` and updates.
- **Legal Compliance:** Privacy Policy and Terms of Service in `/legal/`, rendered as site pages.
- **Firestore Backups:** Scheduled backups enabled in Firebase Console.
- **Firebase Security Rules:** Only authenticated users can access their data; only admins can access admin/payment routes.
- **HTTPS:** Enforced by Vercel and Firebase Hosting.
- **External Scripts:** Audited and minimized for security.

---

## 🔧 Getting Started  

To run this app locally:

1. **Clone this repository:**
    ```bash
    git clone https://github.com/MonicahWainaina/flavorhub254.git
    cd flavorhub254
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    - Create a `.env.local` file in the root directory.
    - Add your Firebase config and any other required keys:
      ```
      NEXT_PUBLIC_FIREBASE_API_KEY=your-key
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
      # ...etc
      ```
    - **Never commit your real `.env.local` or service account files.**

4. **Run the app:**
    ```bash
    npm run dev
    ```

5. **Run tests and lint:**
    ```bash
    npm test
    npm run lint
    ```

---

## 🗄️ Backups & Recovery

- **Firestore:** Scheduled backups are enabled in the Firebase Console (daily/weekly, retained for 90 days).
- **Storage:** Important files should be periodically exported using gsutil or Google Cloud Console.
- **Recovery:** To restore, use the Firebase Console to select and restore a backup, or upload files from backup storage.

---

## 📄 License  

Licensed under the [Apache License, Version 2.0](./LICENSE).  
See the [NOTICE](./NOTICE) file for attribution information.

---

*Built with ❤️ by Monicah Wainaina*  
[Live Demo → flavorhub254.com](https://flavorhub254.com)
