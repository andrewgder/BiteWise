import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useComposerStore } from "../lib/composer";
import { router } from "expo-router";

export default function ScanBarcode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = React.useState(false);
  const add = useComposerStore((s) => s.add);

  React.useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  if (!permission)
    return (
      <View style={sc.container}>
        <Text style={sc.text}>Requesting camera…</Text>
      </View>
    );

  if (!permission.granted)
    return (
      <View style={sc.container}>
        <Text style={sc.text}>
          Camera permission is required to scan barcodes.
        </Text>
        <Pressable style={sc.cta} onPress={requestPermission}>
          <Text style={sc.ctaText}>Grant permission</Text>
        </Pressable>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <CameraView
        style={{ flex: 1 }}
        onBarcodeScanned={({ data }) => {
          if (scanned) return;
          setScanned(true);
          const item = {
            id: String(data),
            name: "Cereal Bar",
            serving: "1 bar (40g)",
            cals: 160,
            p: 6,
            c: 24,
            f: 4,
            barcode: String(data),
          };
          add(item);
          router.back();
        }}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "pdf417",
          ],
        }}
      />
      {scanned && (
        <Pressable style={sc.cta} onPress={() => setScanned(false)}>
          <Text style={sc.ctaText}>Scan again</Text>
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
    padding: 24,
  },
  text: { color: "white", textAlign: "center" },
  cta: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 32,
    backgroundColor: "#58E3A4",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  ctaText: { color: "#000", fontWeight: "600" },
});
