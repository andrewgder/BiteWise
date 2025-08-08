import type { Meal } from "./store";
export function sumMeal(meal: Meal) {
  return meal.items.reduce(
    (acc, i) => ({
      cals: acc.cals + i.cals,
      p: acc.p + i.p,
      c: acc.c + i.c,
      f: acc.f + i.f,
    }),
    { cals: 0, p: 0, c: 0, f: 0 }
  );
}
export function sumDay(day?: { meals: Meal[] }) {
  if (!day) return { cals: 0, p: 0, c: 0, f: 0 };
  return day.meals.reduce(
    (acc, m) => {
      const s = sumMeal(m);
      return {
        cals: acc.cals + s.cals,
        p: acc.p + s.p,
        c: acc.c + s.c,
        f: acc.f + s.f,
      };
    },
    { cals: 0, p: 0, c: 0, f: 0 }
  );
}
export function macroPercent(current: number, target: number) {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
