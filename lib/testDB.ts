// lib/testDb.ts
import { auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";
import {
  collection,
  addDoc,
  getDoc,
  serverTimestamp,
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function runFirestoreTest() {
  // Ensure we have a user (required if your rules check request.auth.uid)
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  const uid = auth.currentUser!.uid;

  // Write a test doc under the user's meals
  const ref = await addDoc(collection(db, "users", uid, "meals"), {
    name: "Test Meal",
    macros: {
      protein: 10,
      carbs: 20,
      fat: 5,
      calories: 10 * 4 + 20 * 4 + 5 * 9,
    },
    serving: { unit: "serving", size: 1 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    _test: true,
  });

  // Read it back once
  const snap = await getDoc(ref);
  const data = snap.data();

  return { id: ref.id, uid, data };
}

// Optional: quick live-listen sanity check
export function subscribeTestMeals(cb: (items: any[]) => void) {
  if (!auth.currentUser) return () => {};
  const uid = auth.currentUser!.uid;
  const colRef = collection(db, "users", uid, "meals");
  return onSnapshot(colRef, (qs) => {
    cb(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
