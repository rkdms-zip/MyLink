"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { ensureProfile } from "@/lib/data";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(null);
      if (u) {
        try {
          setProfile(await ensureProfile(u));
        } catch (e) {
          setError(e.message);
        }
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") setError("로그인에 실패했어요: " + e.message);
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
