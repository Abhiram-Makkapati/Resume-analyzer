"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { syncUserDocument } from "../lib/data";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        await syncUserDocument();
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signInWithGoogle: async () => {
        await signInWithPopup(auth, googleProvider as GoogleAuthProvider);
      },
      signInWithEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signUpWithEmail: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
      },
      signOutUser: async () => {
        await signOut(auth);
      }
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
};
