import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { sumMeal } from "../lib/nutrition";

export default function MealCard({ meal }: any) {
  const s = sumMeal(meal);
  return (
    <View style={mc.card}>
      <Text style={mc.title}>{meal.title}</Text>
      <Text style={mc.meta}>
        {meal.items.length} items • {Math.round(s.cals)} kcal
      </Text>
      {meal.items.slice(0, 3).map((i: any) => (
        <Text key={i.id} style={mc.item}>
          • {i.name} — {i.serving} ({i.cals} kcal)
        </Text>
      ))}
    </View>
  );
}
const mc = StyleSheet.create({
  card: {
    backgroundColor: "#0F141B",
    borderColor: "#1E2630",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  title: { color: "white", fontWeight: "600" },
  meta: { color: "#9AA8B4", fontSize: 12, marginTop: 4 },
  item: { color: "#C8D6E5", fontSize: 12, marginTop: 4 },
});
