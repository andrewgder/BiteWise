// app/(tabs)/index.tsx
import React, { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { runFirestoreTest } from "../../lib/testDB";

export default function Home() {
  const [result, setResult] = useState<string>("");

  async function onTest() {
    try {
      setResult("Running...");
      const res = await runFirestoreTest();
      setResult(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e?.message || String(e)}`);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Home</Text>

      <Pressable
        onPress={onTest}
        style={{
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#1e293b",
        }}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "600" }}
        >
          Run Firestore Test
        </Text>
      </Pressable>

      {!!result && (
        <View
          style={{ padding: 12, borderRadius: 12, backgroundColor: "#0b1220" }}
        >
          <Text selectable style={{ color: "white", fontFamily: "Menlo" }}>
            {result}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
