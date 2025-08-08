import React from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Settings() {
  return (
    <View style={st.container}>
      <Text style={st.h1}>Settings</Text>
      <Pressable
        style={st.card}
        onPress={async () => {
          const dump = await AsyncStorage.getAllKeys().then((keys) =>
            AsyncStorage.multiGet(keys)
          );
          Alert.alert(
            "Data Export",
            JSON.stringify(dump, null, 2).slice(0, 1000) + "..."
          );
        }}
      >
        <Text style={st.cardTitle}>Export local data</Text>
        <Text style={st.sub}>Quick JSON dump (for now)</Text>
      </Pressable>
      <Pressable
        style={[
          st.card,
          { backgroundColor: "#291A1A", borderColor: "#3A2323" },
        ]}
        onPress={async () => {
          await AsyncStorage.clear();
          Alert.alert("Reset", "All local data cleared.");
        }}
      >
        <Text style={{ color: "#FFC8C8" }}>Reset app data</Text>
        <Text style={st.sub}>This cannot be undone</Text>
      </Pressable>
    </View>
  );
}
const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  h1: { color: "white", fontSize: 22, fontWeight: "700" },
  sub: { color: "#9AA8B4", fontSize: 12 },
  card: {
    backgroundColor: "#0F141B",
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderColor: "#1E2630",
    borderWidth: 1,
  },
  cardTitle: { color: "white" },
});
