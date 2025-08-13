// app/scan-barcode.tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { fdcSearchByBarcode } from "../lib/fdc";

export default function ScanBarcode() {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = React.useState(false);
  const lockedRef = React.useRef(false); // prevent multiple navigations

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

  async function handleScan(data: string) {
    if (lockedRef.current || loading) return;
    lockedRef.current = true;
    try {
      setLoading(true);
      const upc = String(data).trim();
      const food = await fdcSearchByBarcode(upc);

      if (food?.fdcId) {
        // Go straight to Add Meal with the selected food
        router.replace({
          pathname: "/add-meal",
          params: { fdcId: String(food.fdcId) },
        });
        return;
      }

      // Not found: let them scan again
      Alert.alert(
        "Not found",
        "We couldn’t find this barcode. Try another scan."
      );
      lockedRef.current = false;
      setLoading(false);
    } catch (e: any) {
      Alert.alert(
        "Scan error",
        e?.message ?? "Something went wrong while looking up this barcode."
      );
      lockedRef.current = false;
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F14" }}>
      <CameraView
        style={{ flex: 1 }}
        // Only scan when not loading/locked
        onBarcodeScanned={
          loading || lockedRef.current
            ? undefined
            : ({ data }) => handleScan(String(data))
        }
        barcodeScannerSettings={{
          // Use the formats your users will actually encounter
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "qr",
            "pdf417",
          ],
        }}
      />

      {/* Top bar with a safe Close */}
      <View style={sc.topBar}>
        <Pressable
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/home")
          }
          style={sc.topBtn}
        >
          <Text style={sc.topBtnText}>Close</Text>
        </Pressable>
      </View>

      {/* Loading overlay during UPC lookup */}
      {loading && (
        <View style={sc.loading}>
          <ActivityIndicator />
          <Text style={sc.loadingTxt}>Looking up item…</Text>
        </View>
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

  topBar: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  topBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  topBtnText: { color: "white", fontWeight: "700" },

  loading: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingTxt: { color: "white", marginTop: 8 },

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
