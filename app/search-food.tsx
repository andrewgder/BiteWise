import React from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useComposerStore } from "../lib/composer";

const MOCK = [
  {
    id: "1",
    name: "Greek Yogurt (Plain, 170g)",
    serving: "170 g",
    cals: 100,
    p: 17,
    c: 6,
    f: 0,
    brand: "Fage",
  },
  {
    id: "2",
    name: "Banana (Medium)",
    serving: "118 g",
    cals: 105,
    p: 1,
    c: 27,
    f: 0,
  },
  {
    id: "3",
    name: "Chicken Breast (Cooked, 100g)",
    serving: "100 g",
    cals: 165,
    p: 31,
    c: 0,
    f: 3,
  },
  {
    id: "4",
    name: "Olive Oil (1 tbsp)",
    serving: "14 g",
    cals: 119,
    p: 0,
    c: 0,
    f: 14,
  },
];

export default function SearchFood() {
  const [q, setQ] = React.useState("");
  const add = useComposerStore((s) => s.add);
  const data = MOCK.filter((i) =>
    i.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <View style={sf.container}>
      <Text style={sf.h1}>Search food</Text>
      <TextInput
        style={sf.input}
        placeholder="Search database..."
        placeholderTextColor="#6B7A88"
        value={q}
        onChangeText={setQ}
      />
      <FlatList
        style={{ marginTop: 12 }}
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable
            style={sf.card}
            onPress={() => {
              add(item);
              router.back();
            }}
          >
            <Text style={sf.cardTitle}>{item.name}</Text>
            <Text style={sf.sub}>
              {item.serving} • {item.cals} kcal • P{item.p} C{item.c} F{item.f}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
const sf = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  h1: { color: "white", fontSize: 20, fontWeight: "700" },
  input: {
    marginTop: 12,
    backgroundColor: "#0F141B",
    color: "white",
    borderColor: "#1E2630",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  card: {
    backgroundColor: "#0F141B",
    borderColor: "#1E2630",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  cardTitle: { color: "white" },
  sub: { color: "#9AA8B4", fontSize: 12 },
});
