'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
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
      setUsername(data.username || '');
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
        // Update last login timestamp
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastLogin: serverTimestamp(),
        });
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

  return (
    <AuthContext.Provider
      value={{
        user,
        username,
        loading,
        logOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
