import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useComposerStore } from "../lib/composer";
import { router } from "expo-router";

export default function ScanBarcode() {
  const [hasPerm, setHasPerm] = React.useState<boolean | null>(null);
  const [scanned, setScanned] = React.useState(false);
  const add = useComposerStore((s) => s.add);

  React.useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPerm(status === "granted");
    })();
  }, []);

  if (hasPerm === null)
    return (
      <View style={sc.container}>
        <Text style={{ color: "white" }}>Requesting camera...</Text>
      </View>
    );
  if (hasPerm === false)
    return (
      <View style={sc.container}>
        <Text style={{ color: "white" }}>No camera access.</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <BarCodeScanner
        style={{ flex: 1 }}
        onBarCodeScanned={({ data }) => {
          if (scanned) return;
          setScanned(true);
          const item = {
            id: data,
            name: "Cereal Bar",
            serving: "1 bar (40g)",
            cals: 160,
            p: 6,
            c: 24,
            f: 4,
            barcode: data,
          };
          add(item);
          router.back();
        }}
      />
      {scanned && (
        <Pressable style={sc.again} onPress={() => setScanned(false)}>
          <Text style={{ color: "#000", fontWeight: "600" }}>Scan again</Text>
        </Pressable>
      )}
    </View>
  );
}
const sc = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    alignItems: "center",
    justifyContent: "center",
  },
  again: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 32,
    backgroundColor: "#58E3A4",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
});
