'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendEmailVerification } from 'firebase/auth';

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
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    try {
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
        // Always reload to get latest emailVerified status
        await firebaseUser.reload();
        setIsEmailVerified(firebaseUser.emailVerified);
        await fetchUserProfile(firebaseUser.uid);
        // Update lastLogin and emailVerified in Firestore
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastLogin: serverTimestamp(),
            emailVerified: firebaseUser.emailVerified, // <-- Sync emailVerified to Firestore
          });
        } catch (err) {
          // Ignore permission errors for lastLogin/emailVerified
          console.warn('Could not update lastLogin/emailVerified:', err?.message || err);
        }
      } else {
        setUser(null);
        setUsername('');
        setIsEmailVerified(false);
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
      // Refresh email verification status
      await auth.currentUser?.reload();
      setIsEmailVerified(auth.currentUser?.emailVerified ?? false);
      // Also update Firestore with latest emailVerified
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          emailVerified: auth.currentUser?.emailVerified ?? false,
        });
      } catch (err) {
        // Ignore errors
      }
      setLoading(false);
    }
  }

  // Resend verification email
  async function resendVerification() {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  }

  // Example logout function
  async function logOut() {
    await auth.signOut();
    setUser(null);
    setUsername('');
    setIsEmailVerified(false);
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
        isEmailVerified,
        logOut,
        refreshUser,
        updateProfileSafe, // expose safe update function
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
