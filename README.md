# flavorHUB254 - Recipe Web App

[![CI](https://github.com/MonicahWainaina/flavorhub254/actions/workflows/ci.yml/badge.svg)](https://github.com/MonicahWainaina/flavorhub254/actions)

Welcome to **flavorHUB254**, a modern recipe web app built with Next.js, Firebase, and React.  
Discover, browse, and save your favorite Kenyan and global recipes—all in one place.

---

## Author

Monicah Wainaina

---

## User Interface

Here are some snapshots of the app's interface:

| Home Page | Browse Recipes | Recipe Details |
|-----------|----------------|---------------|
| ![Home](https://res.cloudinary.com/djlcnpdtn/image/upload/v1756908843/recipe/Homepage.png) | ![Browse](https://res.cloudinary.com/djlcnpdtn/image/upload/v1756908810/recipe/Browse.png) | ![Recipe](https://res.cloudinary.com/djlcnpdtn/image/upload/v1756908449/recipe/Recipepage.png) |

*(Replace with your own screenshots for best results!)*

---

## Features

- **User Authentication:** Secure login and sign-up with Firebase Auth.
- **Browse & Filter Recipes:** Explore recipes by category, ingredient, or search.
- **Favorites:** Save and manage your favorite recipes (requires login).
- **Serving Adjustment:** Scale ingredient quantities for different servings.
- **Responsive Design:** Works on mobile, tablet, and desktop.
- **Firebase Integration:** Recipes and favorites stored securely in Firebase.

---

## Technologies Used

- **Next.js** (React framework)
- **Firebase** (Firestore & Auth)
- **React** (UI library)
- **Tailwind CSS** (styling)
- **Jest** (testing)
- **Vercel** (hosting & CI/CD)

---

## Getting Started

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

## License

MIT

---

*Built with ❤️ by Monicah Wainaina*
