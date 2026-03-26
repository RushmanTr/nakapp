import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export function useFirestoreData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Realtime listener - syncs across devices
  useEffect(() => {
    if (!userId) return;
    const docRef = doc(db, "users", userId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        // First time user - create default data
        const defaultData = {
          customers: [],
          orders: [],
          collections: [],
          driveFiles: [],
          nextId: 20
        };
        setDoc(docRef, defaultData);
        setData(defaultData);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [userId]);

  // Save to Firestore
  const saveData = useCallback(async (newData) => {
    if (!userId) return;
    setData(newData);
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, newData);
  }, [userId]);

  return { data, loading, saveData };
}
