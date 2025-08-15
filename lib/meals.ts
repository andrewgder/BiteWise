// lib/meals.ts
import {
  collection,
  addDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db, now } from "./firebase";
import type { Meal } from "../types/meals";

const mealsCol = (uid: string) => collection(db, "users", uid, "meals");

export async function createMeal(uid: string, meal: Meal) {
  // Defensive: compute calories if not provided
  const cals =
    meal.macros.calories ??
    Math.round(
      meal.macros.protein * 4 + meal.macros.carbs * 4 + meal.macros.fat * 9
    );

  const payload: Meal = {
    ...meal,
    macros: { ...meal.macros, calories: cals },
    createdAt: now(),
    updatedAt: now(),
  };

  const ref = await addDoc(mealsCol(uid), payload as any);
  return { id: ref.id, ...payload };
}

export async function updateMeal(uid: string, id: string, meal: Partial<Meal>) {
  if (meal.macros) {
    const m = meal.macros;
    meal.macros = {
      ...m,
      calories:
        m.calories ??
        Math.round(
          (m.protein ?? 0) * 4 + (m.carbs ?? 0) * 4 + (m.fat ?? 0) * 9
        ),
    };
  }
  await updateDoc(doc(db, "users", uid, "meals", id), {
    ...meal,
    updatedAt: now(),
  } as any);
}

export async function deleteMeal(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "meals", id));
}

export async function getMeal(uid: string, id: string) {
  const snap = await getDoc(doc(db, "users", uid, "meals", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Meal) : null;
}

export async function listMeals(
  uid: string,
  opts?: { search?: string; take?: number }
) {
  const filters = [];
  // All user meals, newest first
  const q = query(
    mealsCol(uid),
    orderBy("updatedAt", "desc"),
    limit(opts?.take ?? 50)
  );
  const snap = await getDocs(q);
  let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Meal));
  if (opts?.search) {
    const s = opts.search.toLowerCase();
    rows = rows.filter((m) => m.name.toLowerCase().includes(s));
  }
  return rows;
}

// Live subscription (for screens that should auto-refresh)
export function subscribeMeals(
  uid: string,
  cb: (meals: Meal[]) => void,
  take: number = 100
) {
  const q = query(mealsCol(uid), orderBy("updatedAt", "desc"), limit(take));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Meal)));
  });
}
