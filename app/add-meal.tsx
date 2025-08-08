import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useMacroStore, todayKey } from "../lib/store";
import { useComposerStore } from "../lib/composer";
import * as Crypto from "expo-crypto";

export default function AddMeal() {
  const [title, setTitle] = React.useState("Meal");
  const items = useComposerStore((s) => s.items);
  const reset = useComposerStore((s) => s.reset);

  return (
    <View style={am.container}>
      <Text style={am.h1}>New Meal</Text>
      <View style={am.card}>
        <Text style={am.label}>Meal title</Text>
        <TextInput
          style={am.input}
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#6B7A88"
        />
      </View>

      <ScrollView style={{ marginTop: 12 }}>
        {items.map((i) => (
          <View key={i.id} style={am.item}>
            <Text style={{ color: "white" }}>
              {i.name} • {i.serving}
            </Text>
            <Text style={am.sub}>
              {i.cals} kcal • P{i.p} C{i.c} F{i.f}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginTop: "auto",
          marginBottom: 24,
        }}
      >
        <Pressable
          style={am.secondary}
          onPress={() => router.push("/search-food")}
        >
          <Text style={{ color: "white" }}>Search food</Text>
        </Pressable>
        <Pressable
          style={am.secondary}
          onPress={() => router.push("/scan-barcode")}
        >
          <Text style={{ color: "white" }}>Scan barcode</Text>
        </Pressable>
      </View>

      <Pressable
        style={am.primary}
        onPress={async () => {
          const id = await Crypto.randomUUID();
          useMacroStore
            .getState()
            .addMeal(todayKey(), {
              id,
              when: new Date().toISOString(),
              title,
              items,
            });
          reset();
          router.back();
        }}
      >
        <Text style={{ color: "#000", fontWeight: "600" }}>Save meal</Text>
      </Pressable>
    </View>
  );
}
const am = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  h1: { color: "white", fontSize: 20, fontWeight: "700" },
  card: {
    backgroundColor: "#0F141B",
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderColor: "#1E2630",
    borderWidth: 1,
  },
  label: { color: "#9AA8B4" },
  input: { color: "white", marginTop: 8 },
  item: {
    backgroundColor: "#0F141B",
    borderColor: "#1E2630",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  sub: { color: "#9AA8B4", fontSize: 12 },
  secondary: {
    flex: 1,
    backgroundColor: "#1B2430",
    borderColor: "#263140",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#58E3A4",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
});
