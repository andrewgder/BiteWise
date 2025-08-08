import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useMacroStore } from "../../lib/store";

export default function Dashboard() {
  const targets = useMacroStore((s) => s.targets);
  const setTargets = useMacroStore((s) => s.setTargets);
  const tweak = (key: keyof typeof targets, delta: number) =>
    setTargets({ [key]: Math.max(0, targets[key] + delta) } as any);
  return (
    <View style={d.container}>
      <Text style={d.h1}>Dashboard</Text>
      <Text style={d.sub}>Adjust your macro targets</Text>
      {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
        <View key={k} style={d.card}>
          <Text style={d.cardTitle}>
            {k}: {targets[k]}
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <Pressable style={d.btn} onPress={() => tweak(k, -10)}>
              <Text style={d.btnText}>-10</Text>
            </Pressable>
            <Pressable style={d.btn} onPress={() => tweak(k, +10)}>
              <Text style={d.btnText}>+10</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <Text style={d.tip}>
        Tip: Long-press to nudge by 1. Targets persist locally.
      </Text>
    </View>
  );
}
const d = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  h1: { color: "white", fontSize: 22, fontWeight: "700" },
  sub: { color: "#9AA8B4", marginTop: 4 },
  card: {
    backgroundColor: "#0F141B",
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderColor: "#1E2630",
    borderWidth: 1,
  },
  cardTitle: { color: "white", textTransform: "capitalize" },
  btn: {
    flex: 1,
    backgroundColor: "#1B2430",
    borderColor: "#263140",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  btnText: { color: "white" },
  tip: { color: "#9AA8B4", fontSize: 12, marginTop: 16 },
});
