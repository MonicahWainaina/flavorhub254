'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Adjust path if needed
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        // Fetch Firestore user data
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const firestoreData = userDoc.exists() ? userDoc.data() : {};
        setUser({
          ...currentUser,
          ...firestoreData, // This will include isPremium and any other custom fields
        });
        setUsername(firestoreData.username || null);
      } else {
        setUser(null);
        setUsername(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, username, loading, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
