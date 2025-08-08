import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

export type MacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
export type FoodItem = {
  id: string;
  name: string;
  brand?: string;
  serving: string;
  cals: number;
  p: number;
  c: number;
  f: number;
  barcode?: string;
};
export type Meal = {
  id: string;
  when: string;
  title: string;
  items: FoodItem[];
};
export type DayLog = { date: string; meals: Meal[] };

interface MacroState {
  targets: MacroTargets;
  logs: Record<string, DayLog>;
  addMeal: (date: string, meal: Meal) => void;
  setTargets: (t: Partial<MacroTargets>) => void;
}

const STORAGE_KEY = "bitewise-state-v1";

export const useMacroStore = create<MacroState>((set, get) => ({
  targets: { calories: 2200, protein: 170, carbs: 220, fat: 70 },
  logs: {
    [dayjs().format("YYYY-MM-DD")]: {
      date: dayjs().format("YYYY-MM-DD"),
      meals: [],
    },
  },
  addMeal: (date, meal) =>
    set((state) => {
      const day = state.logs[date] ?? { date, meals: [] };
      const logs = {
        ...state.logs,
        [date]: { ...day, meals: [meal, ...day.meals] },
      };
      persist({ targets: state.targets, logs });
      return { logs };
    }),
  setTargets: (t) =>
    set((state) => {
      const targets = { ...state.targets, ...t };
      persist({ targets, logs: state.logs });
      return { targets };
    }),
}));

async function persist(data: {
  targets: MacroTargets;
  logs: Record<string, DayLog>;
}) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Persist error", e);
  }
}
export function todayKey() {
  return dayjs().format("YYYY-MM-DD");
}
