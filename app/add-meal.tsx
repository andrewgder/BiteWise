// app/add-meal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  fdcGet,
  FdcFood,
  displayName,
  extractMacros,
  scaleMacros,
  baseGramsFor,
  toStoreMacros,
} from "../lib/fdc";
import { useMacroStore, todayKey } from "../lib/store";

type Mode = "servings" | "grams";

function getFirstParam(p?: string | string[] | null) {
  if (Array.isArray(p)) return p[0];
  return p ?? null;
}

function toNum(txt: string) {
  const n = Number(String(txt).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function kcalFromMacros(p: number, c: number, f: number) {
  return Math.round(4 * p + 4 * c + 9 * f);
}

export default function AddMeal() {
  const params = useLocalSearchParams<{ fdcId?: string | string[] }>();

  // Robust parse for expo-router param (can be string | string[])
  const fdcIdStr = getFirstParam(params?.fdcId);
  const fdcId = fdcIdStr && /^\d+$/.test(fdcIdStr) ? Number(fdcIdStr) : null;

  const [food, setFood] = useState<FdcFood | null>(null);
  const [loading, setLoading] = useState<boolean>(!!fdcId);
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<Mode>("servings");

  // Controls (fdc-driven)
  const [servings, setServings] = useState(1);
  const [grams, setGrams] = useState<number | "">("");

  // Controls (manual macros when no food)
  const [mProtein, setMProtein] = useState<string>("0");
  const [mCarbs, setMCarbs] = useState<string>("0");
  const [mFats, setMFats] = useState<string>("0");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!fdcId) {
        // No imported food → manual entry mode for macros
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const f = await fdcGet(fdcId);
        if (cancelled) return;
        setFood(f);
        setTitle(displayName(f)); // prefill title from the selected food
        const gBase = baseGramsFor(f);
        if (gBase) setGrams(gBase);
      } catch (e: any) {
        if (!cancelled) {
          console.warn("[AddMeal] fdcGet error:", e);
          Alert.alert("Error", e?.message ?? "Failed to load food");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fdcId]);

  const base = useMemo(() => (food ? extractMacros(food) : null), [food]);

  // ---- totals: source-aware (fdc vs manual) ----
  const totals = useMemo(() => {
    if (food) {
      if (mode === "grams") {
        const g = typeof grams === "number" ? grams : Number(grams || 0);
        return scaleMacros(food, { grams: g || 0 });
      }
      return scaleMacros(food, { servings });
    } else {
      // Manual macros path
      const p = toNum(mProtein);
      const c = toNum(mCarbs);
      const f = toNum(mFats);
      const calories = kcalFromMacros(p, c, f);
      return {
        calories,
        protein: p,
        carbs: c,
        fats: f,
      };
    }
  }, [food, mode, servings, grams, mProtein, mCarbs, mFats]);

  const gramsSupported = useMemo(() => {
    const gBase = food ? baseGramsFor(food) : null;
    return !!gBase;
  }, [food]);

  function bumpServings(delta: number) {
    setServings((s) => Math.max(0, +(s + delta).toFixed(2)));
  }

  // if you have an addMeal action
  const addMeal = useMacroStore((s) => s.addMeal);

  function onSave() {
    const id = String(Date.now());
    const date = todayKey();

    // Convert to store shape cals/p/c/f (all numbers)
    const totalsStore = toStoreMacros(totals); // { cals, p, c, f }

    // Build item
    const item = {
      id: id + "-item",
      fdcId: food ? fdcId : undefined,
      name: title.trim(),
      mode: food ? mode : undefined,
      servings: food && mode === "servings" ? servings : undefined,
      grams:
        food && mode === "grams"
          ? typeof grams === "number"
            ? grams
            : 0
          : undefined,
      cals: Number(totalsStore.cals) || 0,
      p: Number(totalsStore.p) || 0,
      c: Number(totalsStore.c) || 0,
      f: Number(totalsStore.f) || 0,
      macros: totalsStore,
    };

    addMeal(date, {
      id,
      date,
      title: title.trim() || "Meal",
      source: food ? "fdc" : "manual",
      fdcId: food ? fdcId : undefined,
      items: [item],
      totals: { cals: item.cals, p: item.p, c: item.c, f: item.f },
    });

    router.dismissAll?.();
    router.replace("/home"); // or "/" if your home is index.tsx
  }

  const showManualMacros = !food; // true when user is creating a meal without imported food

  return (
    <SafeAreaView edges={["top", "bottom"]} style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={s.h1}>Add Meal</Text>

          {/* Title */}
          <View style={s.card}>
            <Text style={s.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Meal name"
              placeholderTextColor="#94A3B8"
              style={s.input}
            />
            {food ? (
              <Text style={s.help}>Selected: {displayName(food)}</Text>
            ) : (
              <Text style={s.help}>
                No food imported — enter macros manually.
              </Text>
            )}
          </View>

          {/* FDC controls only when food exists */}
          {food && (
            <>
              {/* Mode toggle */}
              <View style={s.toggleRow}>
                <Pressable
                  style={[
                    s.toggleBtn,
                    mode === "servings" && s.toggleBtnActive,
                  ]}
                  onPress={() => setMode("servings")}
                >
                  <Text
                    style={[
                      s.toggleTxt,
                      mode === "servings" && s.toggleTxtActive,
                    ]}
                  >
                    Servings
                  </Text>
                </Pressable>
                <Pressable
                  disabled={!gramsSupported}
                  style={[
                    s.toggleBtn,
                    mode === "grams" && s.toggleBtnActive,
                    !gramsSupported && s.toggleBtnDisabled,
                  ]}
                  onPress={() => gramsSupported && setMode("grams")}
                >
                  <Text
                    style={[
                      s.toggleTxt,
                      mode === "grams" && s.toggleTxtActive,
                      !gramsSupported && s.toggleTxtDisabled,
                    ]}
                  >
                    Grams
                  </Text>
                </Pressable>
              </View>

              {/* Controls */}
              {mode === "servings" ? (
                <View style={s.card}>
                  <Text style={s.label}>Servings</Text>
                  <View style={s.stepRow}>
                    <Pressable
                      style={s.step}
                      onPress={() => bumpServings(-0.5)}
                    >
                      <Text style={s.stepTxt}>−</Text>
                    </Pressable>
                    <TextInput
                      value={String(servings)}
                      onChangeText={(t) =>
                        setServings(Math.max(0, Number(t) || 0))
                      }
                      keyboardType="decimal-pad"
                      style={[s.input, { width: 100, textAlign: "center" }]}
                    />
                    <Pressable
                      style={s.step}
                      onPress={() => bumpServings(+0.5)}
                    >
                      <Text style={s.stepTxt}>＋</Text>
                    </Pressable>
                  </View>
                  {food?.servingSize ? (
                    <Text style={s.help}>
                      1 serving = {food.servingSize}{" "}
                      {food.servingSizeUnit || ""}
                    </Text>
                  ) : (
                    <Text style={s.help}>
                      Servings multiply the base nutrition from the source.
                    </Text>
                  )}
                </View>
              ) : (
                <View style={s.card}>
                  <Text style={s.label}>Weight (g)</Text>
                  <TextInput
                    value={grams === "" ? "" : String(grams)}
                    onChangeText={(t) => {
                      const n = Number(t);
                      setGrams(Number.isFinite(n) ? n : "");
                    }}
                    keyboardType="numeric"
                    style={[s.input, { width: 120 }]}
                  />
                  {food && (
                    <Text style={s.help}>
                      Base for scaling: {baseGramsFor(food)} g
                    </Text>
                  )}
                </View>
              )}
            </>
          )}

          {/* Manual macros entry when no food imported */}
          {showManualMacros && (
            <View style={s.card}>
              <Text style={s.label}>Manual Macros</Text>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.smallLbl}>Protein (g)</Text>
                    <TextInput
                      keyboardType="numeric"
                      inputMode="decimal"
                      value={mProtein}
                      onChangeText={setMProtein}
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                      style={s.input}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.smallLbl}>Carbs (g)</Text>
                    <TextInput
                      keyboardType="numeric"
                      inputMode="decimal"
                      value={mCarbs}
                      onChangeText={setMCarbs}
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                      style={s.input}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.smallLbl}>Fats (g)</Text>
                    <TextInput
                      keyboardType="numeric"
                      inputMode="decimal"
                      value={mFats}
                      onChangeText={setMFats}
                      placeholder="0"
                      placeholderTextColor="#94A3B8"
                      style={s.input}
                    />
                  </View>
                </View>

                <View>
                  <Text style={s.smallLbl}>Calories (kcal)</Text>
                  <TextInput
                    editable={false}
                    value={String(totals.calories || 0)}
                    style={[
                      s.input,
                      { backgroundColor: "#0B1117", opacity: 0.9 },
                    ]}
                  />
                  <Text style={s.help}>
                    kcal is calculated from macros (4/4/9).
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Nutrition preview */}
          <View style={s.card}>
            <Text style={s.label}>Nutrition</Text>
            {loading && (
              <View style={s.loadingRow}>
                <ActivityIndicator />
                <Text style={[s.help, { marginLeft: 8 }]}>
                  Loading nutrition…
                </Text>
              </View>
            )}

            {!loading &&
            food &&
            totals.calories === 0 &&
            totals.protein === 0 &&
            totals.carbs === 0 &&
            totals.fats === 0 ? (
              <Text style={s.help}>
                No nutrient data found for this item. Try another item or adjust
                serving/grams.
              </Text>
            ) : (
              <View style={s.macrosRow}>
                <View style={s.macroItem}>
                  <Text style={s.macroVal}>{totals.calories}</Text>
                  <Text style={s.macroLbl}>kcal</Text>
                </View>
                <View style={s.macroItem}>
                  <Text style={s.macroVal}>{totals.protein}</Text>
                  <Text style={s.macroLbl}>Protein (g)</Text>
                </View>
                <View style={s.macroItem}>
                  <Text style={s.macroVal}>{totals.carbs}</Text>
                  <Text style={s.macroLbl}>Carbs (g)</Text>
                </View>
                <View style={s.macroItem}>
                  <Text style={s.macroVal}>{totals.fats}</Text>
                  <Text style={s.macroLbl}>Fats (g)</Text>
                </View>
              </View>
            )}
          </View>

          {/* Save */}
          <Pressable
            style={[s.saveBtn, (!title.trim() || loading) && s.saveBtnDisabled]}
            onPress={onSave}
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#06240F" />
            ) : (
              <Text style={s.saveTxt}>Save Meal</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0F14" },
  scroll: { padding: 16, paddingBottom: 24 },

  h1: { color: "white", fontSize: 20, fontWeight: "800", marginBottom: 12 },

  card: {
    backgroundColor: "#0E141B",
    borderColor: "#1F2A37",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  label: { color: "white", fontWeight: "700", marginBottom: 8 },
  smallLbl: { color: "white", marginBottom: 6, fontSize: 12, opacity: 0.9 },

  input: {
    backgroundColor: "#0B1117",
    borderColor: "#1F2A37",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "white",
    flex: 1,
  },
  help: { color: "#9AA8B4", marginTop: 6 },

  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: "#0E141B",
    borderColor: "#1F2A37",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: "#1C2A3A",
    borderColor: "#334155",
  },
  toggleBtnDisabled: { opacity: 0.4 },
  toggleTxt: { color: "#94A3B8", fontWeight: "700" },
  toggleTxtActive: { color: "white" },
  toggleTxtDisabled: { color: "#64748B" },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  step: {
    backgroundColor: "#15202B",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderColor: "#243445",
    borderWidth: 1,
  },
  stepTxt: { color: "white", fontSize: 16, fontWeight: "800" },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 6,
  },

  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 6,
  },
  macroItem: { alignItems: "center", flex: 1 },
  macroVal: { color: "white", fontSize: 18, fontWeight: "800" },
  macroLbl: { color: "#9AA8B4", marginTop: 2, fontSize: 12 },

  saveBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveTxt: { color: "#06240F", fontWeight: "800" },
});
