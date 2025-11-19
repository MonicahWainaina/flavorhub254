'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AuthContext = createContext();

// Helper: filter out premium fields from any update
function filterOutPremiumFields(data) {
  const {
    isPremium,
    premiumSince,
    premiumExpires,
    lastPaymentRef,
    stripeSubscriptionActive,
    subscriptionType,
    ...safeFields
  } = data;
  return safeFields;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    try {
      console.log('Fetching user profile for UID:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          uid,
          email: auth.currentUser?.email,
          isPremium: !!data.isPremium,
          premiumExpires: data.premiumExpires || null,
          subscriptionType: data.subscriptionType || 'mpesa',
          stripeSubscriptionActive: !!data.stripeSubscriptionActive,
          ...data,
        });
        setUsername(data.username || auth.currentUser?.displayName || '');
      } else {
        setUser(null);
        setUsername('');
        console.warn('User document does not exist for UID:', uid);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      setUsername('');
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
        // Only update lastLogin, never send premium fields
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastLogin: serverTimestamp(),
          });
        } catch (err) {
          // Ignore permission errors for lastLogin
          console.warn('Could not update lastLogin:', err?.message || err);
        }
      } else {
        setUser(null);
        setUsername('');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Manual refresh function
  async function refreshUser() {
    if (user?.uid) {
      setLoading(true);
      await fetchUserProfile(user.uid);
      setLoading(false);
    }
  }

  // Example logout function
  async function logOut() {
    await auth.signOut();
    setUser(null);
    setUsername('');
  }

  // Example safe profile update function (for use in profile editing UI)
  async function updateProfileSafe(updateData) {
    if (!user?.uid) return;
    const safeFields = filterOutPremiumFields(updateData);
    await updateDoc(doc(db, 'users', user.uid), safeFields);
    await fetchUserProfile(user.uid);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        loading,
        logOut,
        refreshUser,
        updateProfileSafe, // expose safe update function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
