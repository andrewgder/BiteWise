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
// lib/nutrition.ts
export function sumDay(day?: { meals?: any[] }) {
  let cals = 0,
    p = 0,
    c = 0,
    f = 0;
  if (!day?.meals) return { cals, p, c, f };

  for (const meal of day.meals) {
    // prefer meal.totals if present
    if (meal?.totals) {
      cals += Number(meal.totals.cals) || 0;
      p += Number(meal.totals.p) || 0;
      c += Number(meal.totals.c) || 0;
      f += Number(meal.totals.f) || 0;
      continue;
    }
    // else sum items (flattened or nested)
    for (const it of meal.items ?? []) {
      const m = it.macros ?? it; // supports {macros:{cals,p,c,f}} or {cals,p,c,f}
      cals += Number(m.cals) || 0;
      p += Number(m.p) || 0;
      c += Number(m.c) || 0;
      f += Number(m.f) || 0;
    }
  }
  return { cals, p, c, f };
}

export function macroPercent(current: number, target: number) {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
