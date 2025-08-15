// types/meals.ts
import type { Timestamp } from "firebase/firestore";

export type Macros = {
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
  calories: number; // computed: P*4 + C*4 + F*9
};

export type ServingInfo = {
  unit: "serving" | "g" | "ml";
  size: number;
};

export type Meal = {
  id?: string;
  name: string;
  notes?: string;
  tags?: string[];
  macros: Macros; // per 1 serving (as defined by ServingInfo)
  serving: ServingInfo;
  createdAt?: Timestamp; // Firestore server timestamp
  updatedAt?: Timestamp;
};
