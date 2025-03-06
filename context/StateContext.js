import { useRouter } from 'next/router';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {database } from "@/backend/Database"; // Ensure correct Firebase imports
import { doc, getDoc } from "firebase/firestore";

const Context = createContext();

export const StateContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { asPath } = router;

  useEffect(() => {
    if (router.isReady) {
      const storedUser = window.localStorage.getItem("userAuthToken");

      if (storedUser) {
        console.log('User is already logged in');
        const parsedUser = JSON.parse(storedUser);
        fetchUserRole(parsedUser.uid); // Fetch role from Firestore
      }

      // Redirect if user is not authenticated but accessing a protected route
      if (!storedUser && asPath.includes('/dashboard')) {
        router.push('/');
      }
    }
  }, [router.isReady]);

  // Fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    const userDoc = await getDoc(doc(database, "users", uid));
    if (userDoc.exists()) {
      setUser({ uid, ...userDoc.data() });
    } else {
      console.warn("User document not found in database.");
      setUser(null);
    }
  };

  return (
    <Context.Provider value={{ user, setUser }}>
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => useContext(Context);
