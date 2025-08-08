import { create } from "zustand";
import type { FoodItem } from "./store";

interface ComposerState {
  items: FoodItem[];
  add: (i: FoodItem) => void;
  reset: () => void;
}
export const useComposerStore = create<ComposerState>((set) => ({
  items: [],
  add: (i) => set((s) => ({ items: [i, ...s.items] })),
  reset: () => set({ items: [] }),
}));
