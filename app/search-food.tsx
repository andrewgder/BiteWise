import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFdcSearch } from "../hooks/UseFdcSearch";
import { displayName, extractMacros, servingText, FdcFood } from "../lib/fdc";
import { router } from "expo-router";

export default function SearchFood() {
  const [q, setQ] = useState("");
  const { data, loading, error } = useFdcSearch(q);

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.container}>
        <TextInput
          style={s.input}
          placeholder="Search foods (e.g., chicken breast)"
          placeholderTextColor="#94A3B8"
          value={q}
          onChangeText={setQ}
          autoFocus
        />

        {loading ? <Text style={s.info}>Searching…</Text> : null}
        {error ? <Text style={s.err}>{error}</Text> : null}

        <FlatList
          data={data}
          keyExtractor={(item) => String(item.fdcId)}
          renderItem={({ item }) => <Row item={item} />}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}

function Row({ item }: { item: FdcFood }) {
  const m = extractMacros(item);
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/add-meal",
          params: { fdcId: String(item.fdcId) },
        })
      }
      style={s.row}
    >
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{displayName(item)}</Text>
        <Text style={s.sub}>
          {m.calories} kcal · P {m.protein}g · C {m.carbs}g · F {m.fats}g ·{" "}
          {servingText(item)}
        </Text>
      </View>
      <Text style={s.chev}>›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: "#0E141B",
    borderColor: "#1F2A37",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "white",
    marginBottom: 12,
  },
  row: {
    paddingVertical: 12,
    borderBottomColor: "#1F2A37",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: { color: "white", fontWeight: "700" },
  sub: { color: "#9AA8B4", marginTop: 2 },
  chev: { color: "#64748B", fontSize: 22, paddingHorizontal: 8 },
  info: { color: "#9AA8B4", marginVertical: 8 },
  err: { color: "#FCA5A5", marginVertical: 8 },
});
