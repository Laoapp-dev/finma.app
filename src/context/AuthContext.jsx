import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "../firebase";
import { isAdminEmail } from "../config/admin";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return; // App.jsx shows a config-error screen instead

    // Safety net: on a slow or flaky mobile connection, the Firestore calls
    // below can hang or fail silently, which previously left `loading` stuck
    // at `true` forever — the Sign In button would show its loading skeleton
    // indefinitely instead of ever appearing. Force it to resolve after 6s
    // regardless, so the button always shows up (tapping it will surface any
    // real underlying error via signInWithGoogle's own try/catch).
    const safetyTimer = setTimeout(() => setLoading(false), 6000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          const ref = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setProfile(snap.data());
          } else {
            const newProfile = {
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || "",
              primaryCurrency: "LAK",
              language: "en",
              createdAt: serverTimestamp(),
            };
            await setDoc(ref, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        // Network hiccup fetching/creating the profile doc shouldn't block
        // the UI from ever showing — the user is still signed in either way.
        console.error("Failed to load/create profile:", err);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  // If signInWithGoogle fell back to a redirect (see below), the browser
  // navigates away and back — this picks up the result (and surfaces any
  // error, e.g. an unauthorized domain) once we're back.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect sign-in failed:", err);
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // Many mobile in-app browsers (Facebook/Messenger/Instagram/LINE's
      // built-in browser, etc.) block or don't support popups at all —
      // fall back to a full-page redirect, which works in those contexts.
      const popupUnavailable = [
        "auth/popup-blocked",
        "auth/operation-not-supported-in-this-environment",
        "auth/popup-closed-by-user",
        "auth/cancelled-popup-request",
      ].includes(err?.code);

      if (popupUnavailable) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const updateProfile = useCallback(
    async (partial) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, partial, { merge: true });
      setProfile((prev) => ({ ...prev, ...partial }));
    },
    [user]
  );

  const isAdmin = isAdminEmail(user?.email);

  const value = useMemo(
    () => ({ user, profile, isAdmin, loading, signInWithGoogle, signOut, updateProfile }),
    [user, profile, isAdmin, loading, signInWithGoogle, signOut, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
