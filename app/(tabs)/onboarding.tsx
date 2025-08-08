import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Onboarding() {
  return (
    <View style={s.container}>
      <Text style={s.title}>BiteWise</Text>
      <Text style={s.sub}>
        Track calories & macros with speed. Scan, search, and log meals in
        seconds.
      </Text>
      <Pressable style={s.cta} onPress={() => router.replace("/(tabs)/home")}>
        <Text style={s.ctaText}>Get started</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: "flex-end",
  },
  title: { color: "white", fontSize: 32, fontWeight: "800" },
  sub: { color: "#9AA8B4", marginTop: 8, fontSize: 14 },
  cta: {
    marginTop: 24,
    backgroundColor: "#58E3A4",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  ctaText: { color: "#000", fontWeight: "600" },
});
