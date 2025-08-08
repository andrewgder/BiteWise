import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MacroRing({
  label,
  value,
  target,
}: {
  label: string;
  value: number;
  target: number;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(target, 1)) * 100));
  return (
    <View style={mr.card}>
      <View style={mr.circle} />
      <Text style={mr.value}>{pct}%</Text>
      <Text style={mr.label}>{label}</Text>
      <Text style={mr.sub}>
        {Math.round(value)}/{target}
      </Text>
    </View>
  );
}
const mr = StyleSheet.create({
  card: {
    width: "30%",
    backgroundColor: "#0F141B",
    borderColor: "#1E2630",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#58E3A4",
  },
  value: { color: "white", fontSize: 16, fontWeight: "600", marginTop: 8 },
  label: { color: "#9AA8B4", fontSize: 12 },
  sub: { color: "#9AA8B4", fontSize: 12 },
});
