import React from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useMacroStore, todayKey } from "../../lib/store";
import { sumDay } from "../../lib/nutrition";
import MacroRing from "../../components/MacroRing";
import MealCard from "../../components/MealCard";

export default function Home() {
  const logs = useMacroStore((s) => s.logs);
  const targets = useMacroStore((s) => s.targets);
  const today = logs[todayKey()];
  const totals = sumDay(today);
  return (
    <View style={h.container}>
      <Text style={h.h1}>Today</Text>
      <Text style={h.sub}>{today?.date}</Text>
      <View style={h.ringsRow}>
        <MacroRing
          label="Calories"
          value={totals.cals}
          target={targets.calories}
        />
        <MacroRing label="Protein" value={totals.p} target={targets.protein} />
        <MacroRing label="Carbs" value={totals.c} target={targets.carbs} />
      </View>
      <Pressable style={h.addBtn} onPress={() => router.push("/add-meal")}>
        <Text style={h.addBtnText}>+ Add meal</Text>
      </Pressable>
      <FlatList
        style={{ marginTop: 12 }}
        data={today?.meals || []}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MealCard meal={item} />}
        ListEmptyComponent={
          <Text style={h.empty}>No meals yet. Tap “+ Add meal”.</Text>
        }
      />
    </View>
  );
}
const h = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  h1: { color: "white", fontSize: 22, fontWeight: "700" },
  sub: { color: "#9AA8B4" },
  ringsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  addBtn: {
    marginTop: 16,
    backgroundColor: "#1B2430",
    borderColor: "#263140",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  addBtnText: { color: "white", fontWeight: "600" },
  empty: { color: "#9AA8B4", marginTop: 16 },
});
