import React from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMacroStore, todayKey } from "../../lib/store";
import { sumDay } from "../../lib/nutrition";
import MacroRing from "../../components/MacroRing";
import MealCard from "../../components/MealCard";

const SEARCH_ROUTE = "/search-food"; // adjust if different
const SCAN_ROUTE = "/scan-barcode"; // adjust if different
const ADD_MEAL_ROUTE = "/add-meal";

export default function Home() {
  const logs = useMacroStore((s) => s.logs);
  const targets = useMacroStore((s) => s.targets);
  const today = logs[todayKey()];
  const totals = sumDay(today) || { cals: 0, p: 0, c: 0, f: 0 };
  const dateLabel =
    typeof today?.date === "string" ? today.date : new Date().toDateString();

  return (
    <View style={h.container}>
      {/* Top safe area so the header sits below the notch */}
      <SafeAreaView edges={["top"]} style={h.safeHeaderBg}>
        <View style={h.headerCard}>
          <Text style={h.brand}>BiteWise</Text>
          <Text style={h.tagline}>Calorie & Macro Tracker</Text>

          <View style={h.actionsRow}>
            <Pressable
              style={[h.actionBtn, h.actionBtnLight]}
              onPress={() => router.push(SEARCH_ROUTE)}
            >
              <Text style={[h.actionBtnText, h.actionBtnTextDark]}>
                🔎 Search Foods
              </Text>
            </Pressable>
            <Pressable
              style={h.actionBtn}
              onPress={() => router.push(SCAN_ROUTE)}
            >
              <Text style={h.actionBtnText}>📷 Scan Barcode</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      {/* Daily summary card */}
      <View style={h.card}>
        <View style={h.cardHeaderRow}>
          <Text style={h.cardTitle}>🔥 Daily Summary</Text>
          <Pressable
            style={h.addFood}
            onPress={() => router.push(ADD_MEAL_ROUTE)}
          >
            <Text style={h.addFoodText}>+ Add Food</Text>
          </Pressable>
        </View>

        <View style={h.summaryRow}>
          <View>
            <Text style={h.kcalBig}>{totals.cals || 0}</Text>
            <Text style={h.kcalSub}>of {targets?.calories || 0} kcal</Text>
            <Text style={h.kcalSub}>{dateLabel}</Text>
          </View>
        </View>
      </View>

      {/* Macros with circular rings + horizontal labels */}
      <Text style={h.sectionLabel}>Macros</Text>
      <View style={h.card}>
        <View style={h.macrosCol}>
          <MacroRing
            label="Protein"
            value={totals.p || 0}
            target={targets?.protein || 0}
          />
          <View style={h.divider} />
          <MacroRing
            label="Carbs"
            value={totals.c || 0}
            target={targets?.carbs || 0}
          />
          <View style={h.divider} />
          <MacroRing
            label="Fats"
            value={totals.f || 0}
            target={targets?.fats || 0}
          />
        </View>
      </View>

      {/* Meals */}
      <FlatList
        style={{ marginTop: 12 }}
        data={today?.meals || []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MealCard meal={item} />}
        ListEmptyComponent={
          <Text style={h.empty}>No meals yet. Tap “+ Add Food”.</Text>
        }
        contentContainerStyle={{ paddingBottom: 28 }}
      />
    </View>
  );
}

const h = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    // paddingHorizontal: 16,
    // NOTE: no paddingTop here—SafeAreaView handles top spacing
  },

  // Safe header background fills behind the notch
  safeHeaderBg: {
    backgroundColor: "#10B981",
  },

  // Header content
  headerCard: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12, // extra breathing room below the notch
  },
  brand: { color: "white", fontSize: 22, fontWeight: "800" },
  tagline: { color: "rgba(255,255,255,0.9)", marginTop: 2 },

  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  actionBtn: {
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: "center",
  },
  actionBtnLight: {
    backgroundColor: "rgba(255,255,255,0.92)",
    marginRight: 8,
  },
  actionBtnText: { color: "white", fontWeight: "700" },
  actionBtnTextDark: { color: "#0B0F14", fontWeight: "700" },

  // Generic card
  card: {
    backgroundColor: "#0E141B",
    borderColor: "#1F2A37",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "700" },

  // Daily Summary
  summaryRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  kcalBig: { color: "white", fontSize: 40, fontWeight: "800", lineHeight: 44 },
  kcalSub: { color: "#9AA8B4", marginTop: 2 },

  // Macros list
  sectionLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 16,
  },
  macrosCol: { gap: 12 },
  divider: { height: 1, backgroundColor: "#1F2A37", opacity: 0.7 },

  // Add Food button
  addFood: {
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addFoodText: { color: "#06240F", fontWeight: "800" },

  // Empty state
  empty: { color: "#9AA8B4", marginTop: 16, textAlign: "center" },
});
