// lib/fdc.ts

const FDC_BASE = "https://api.nal.usda.gov/fdc/v1";
const API_KEY = process.env.EXPO_PUBLIC_FDC_API_KEY;

/* ----------------------------- Types ----------------------------- */

export type FdcFood = {
  fdcId: number;
  description: string;
  dataType?: string; // "Branded" | "Survey (FNDDS)" | "SR Legacy" | "Foundation"
  brandOwner?: string;
  brandName?: string;
  gtinUpc?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  labelNutrients?: {
    calories?: { value?: number };
    protein?: { value?: number };
    fat?: { value?: number };
    carbohydrates?: { value?: number };
  };
  foodPortions?: {
    gramWeight?: number;
    modifier?: string; // e.g., "1 cup"
    portionDescription?: string; // e.g., "Nachos, regular"
  }[];
  foodNutrients?: {
    // shape from /foods/search
    nutrientName?: string;
    unitName?: string;
    value?: number;
    // shape from /food/{id}
    nutrient?: {
      name?: string;
      number?: string; // e.g. "1008" = Energy
      unitName?: string; // e.g. "kcal", "g"
    };
    // some responses also include: nutrientNumber?: string
    nutrientNumber?: string;
  }[];
};

export type FdcSearchResponse = {
  foods: FdcFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
};

export type MacroSummary = {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fats: number; // g
};

/* --------------------------- Utilities --------------------------- */

function invariant(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function qs(
  params: Record<string, string | number | boolean | string[] | undefined>
) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((vv) => sp.append(k, vv));
    else sp.set(k, String(v));
  }
  return sp.toString();
}

// Safe nutrient field helpers (support both response shapes)
function nName(n: any): string {
  return String(n?.nutrientName ?? n?.nutrient?.name ?? "").toLowerCase();
}
function nUnit(n: any): string {
  return String(n?.unitName ?? n?.nutrient?.unitName ?? "").toLowerCase();
}
function nNumber(n: any): string {
  return String(n?.nutrientNumber ?? n?.nutrient?.number ?? "");
}

/* ---------------------------- API Calls -------------------------- */

export async function fdcSearch({
  query,
  pageSize = 25,
  pageNumber = 1,
  dataTypes = ["Branded", "Survey (FNDDS)", "SR Legacy", "Foundation"],
}: {
  query: string;
  pageSize?: number;
  pageNumber?: number;
  dataTypes?: string[];
}): Promise<FdcSearchResponse> {
  invariant(API_KEY, "Missing EXPO_PUBLIC_FDC_API_KEY");
  const url =
    `${FDC_BASE}/foods/search?${qs({ query, pageSize, pageNumber })}` +
    dataTypes.map((d) => `&dataType=${encodeURIComponent(d)}`).join("") +
    `&api_key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`FDC search failed (${res.status})`);
  return (await res.json()) as FdcSearchResponse;
}

export async function fdcGet(fdcId: number | string): Promise<FdcFood> {
  invariant(API_KEY, "Missing EXPO_PUBLIC_FDC_API_KEY");
  const res = await fetch(`${FDC_BASE}/food/${fdcId}?api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`FDC get failed (${res.status})`);
  return (await res.json()) as FdcFood;
}

/** Exact UPC lookup (Branded). Returns the best match or null. */
export async function fdcSearchByBarcode(upc: string): Promise<FdcFood | null> {
  const resp = await fdcSearch({
    query: upc,
    pageSize: 10,
    dataTypes: ["Branded"],
  });
  const exact = resp.foods.find((f) => f.gtinUpc === upc);
  return exact ?? resp.foods[0] ?? null;
}

/* ------------------------- Data Extraction ------------------------ */

// helper to read the numeric amount regardless of shape
function nVal(n: any): number {
  const v = n?.value ?? n?.amount;
  return Number.isFinite(v) ? Number(v) : 0;
}
export function extractMacros(food: FdcFood): MacroSummary {
  // 1) Prefer Branded labelNutrients when present
  const ln = food.labelNutrients;
  if (ln && (ln.calories || ln.protein || ln.carbohydrates || ln.fat)) {
    const calories = Math.round(Number(ln.calories?.value ?? 0));
    const protein = +Number(ln.protein?.value ?? 0).toFixed(1);
    const carbs = +Number(ln.carbohydrates?.value ?? 0).toFixed(1);
    const fats = +Number(ln.fat?.value ?? 0).toFixed(1);
    return { calories, protein, carbs, fats };
  }

  // 2) Otherwise use foodNutrients (supports value/amount and both shapes)
  const list = Array.isArray(food.foodNutrients) ? food.foodNutrients : [];

  const byNumber = (num: string) => {
    const hit = list.find((n) => nNumber(n) === num);
    return hit ? nVal(hit) : 0;
  };

  let calories = byNumber("1008"); // Energy (kcal)
  let protein = byNumber("1003"); // Protein (g)
  let carbs = byNumber("1005"); // Carbohydrate (g)
  let fats = byNumber("1004"); // Total lipid (fat) (g)

  if (!calories) {
    const m =
      list.find((n) => nName(n).includes("energy") && nUnit(n) === "kcal") ??
      list.find((n) => nName(n).includes("kcal"));
    calories = m ? nVal(m) : 0;
  }
  if (!protein) {
    const m = list.find((n) => nName(n).includes("protein"));
    protein = m ? nVal(m) : 0;
  }
  if (!carbs) {
    const m = list.find(
      (n) => nName(n).includes("carbohydrate") || nName(n).includes("carb")
    );
    carbs = m ? nVal(m) : 0;
  }
  if (!fats) {
    const m = list.find(
      (n) => nName(n).includes("total lipid") || nName(n).includes("fat")
    );
    fats = m ? nVal(m) : 0;
  }

  return {
    calories: Math.round(Number(calories) || 0),
    protein: +(Number(protein) || 0).toFixed(1),
    carbs: +(Number(carbs) || 0).toFixed(1),
    fats: +(Number(fats) || 0).toFixed(1),
  };
}

/** User-facing display name (description + brand if available). */
export function displayName(food: FdcFood) {
  const brand = food.brandName || food.brandOwner;
  return brand ? `${food.description} · ${brand}` : food.description;
}

/** Serving descriptor (household text or numeric size/unit). */
export function servingText(food: FdcFood) {
  if (food.householdServingFullText) return food.householdServingFullText;
  if (food.servingSize && food.servingSizeUnit)
    return `${food.servingSize} ${food.servingSizeUnit}`;
  return "per serving";
}

/* ----------------------- Scaling & Conversions -------------------- */

/**
 * Base grams for scaling:
 * - Non-branded datasets typically express nutrients per 100 g → return 100.
 * - Branded foods may provide servingSize in grams → return that.
 * - Otherwise, grams are unknown → return null.
 */
export function baseGramsFor(food: FdcFood): number | null {
  if (food.dataType && food.dataType !== "Branded") return 100;
  if (food.servingSize && (food.servingSizeUnit || "").toLowerCase() === "g") {
    return food.servingSize;
  }
  return null;
}

/**
 * Scale macros by servings or grams.
 * If grams provided AND base grams known → scale by grams.
 * Otherwise → multiply by servings.
 */
export function scaleMacros(
  food: FdcFood,
  opts: { servings?: number; grams?: number }
): MacroSummary {
  const base = extractMacros(food); // per serving (Branded) or often per 100g (non-branded)
  const gramsBase = baseGramsFor(food);
  const servings = Math.max(0, opts.servings ?? 1);

  if (typeof opts.grams === "number" && gramsBase && gramsBase > 0) {
    const factor = opts.grams / gramsBase;
    return {
      calories: Math.round(base.calories * factor),
      protein: +(base.protein * factor).toFixed(1),
      carbs: +(base.carbs * factor).toFixed(1),
      fats: +(base.fats * factor).toFixed(1),
    };
  }

  // fallback: multiply by servings
  return {
    calories: Math.round(base.calories * servings),
    protein: +(base.protein * servings).toFixed(1),
    carbs: +(base.carbs * servings).toFixed(1),
    fats: +(base.fats * servings).toFixed(1),
  };
}

// lib/fdc.ts
export type StoreMacros = { cals: number; p: number; c: number; f: number };

export function toStoreMacros(m: MacroSummary): StoreMacros {
  return {
    cals: m.calories,
    p: m.protein,
    c: m.carbs,
    f: m.fats,
  };
}
