import { useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase";
import { useAuth } from "../context/AuthContext";

const CONFIG_DOC = "app_config/global";

export function useAppConfig() {
  const [config, setConfig] = useState({ maintenanceMode: false });
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const ref = doc(db, CONFIG_DOC);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setConfig(snap.exists() ? snap.data() : { maintenanceMode: false });
        setLoading(false);
      },
      () => setLoading(false) // e.g. offline — fail open rather than blocking the app
    );
    return unsubscribe;
  }, []);

  const setMaintenanceMode = useCallback(
    async (maintenanceMode) => {
      if (!isAdmin) return; // firestore.rules would reject this anyway; guard client-side too
      const ref = doc(db, CONFIG_DOC);
      await setDoc(
        ref,
        { maintenanceMode, updatedAt: serverTimestamp(), updatedBy: user?.email || null },
        { merge: true }
      );
    },
    [isAdmin, user]
  );

  return { ...config, loading, setMaintenanceMode };
}
