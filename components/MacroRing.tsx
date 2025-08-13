import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = {
  label: string;
  value: number;
  target: number;
  size?: number; // outer diameter
  stroke?: number; // ring thickness
  showPercentInCenter?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  layout?: "horizontal" | "vertical"; // NEW: vertical puts text under the ring
  unit?: string; // e.g., "g" (defaults to "g" except for Calories)
};

export default function MacroRing({
  label,
  value,
  target,
  size = 82,
  stroke = 10,
  showPercentInCenter = true,
  gradientFrom = "#8B5CF6",
  gradientTo = "#EC4899",
  layout = "vertical",
  unit,
}: Props) {
  const pct =
    target > 0
      ? Math.max(0, Math.min(100, Math.round((value / target) * 100)))
      : 0;

  const half = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  const u = unit ?? (label.toLowerCase() === "calories" ? "kcal" : "g");

  const Ring = (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={gradientFrom} />
            <Stop offset="1" stopColor={gradientTo} />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={half}
          cy={half}
          r={radius}
          stroke="#E5EAF0"
          strokeOpacity={0.35}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={half}
          cy={half}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - dash}
          transform={`rotate(-90 ${half} ${half})`}
        />
      </Svg>

      {/* Center text */}
      <View style={[s.center, { width: size, height: size }]}>
        <Text style={s.percentText}>
          {showPercentInCenter ? `${pct}%` : `${value}`}
        </Text>
      </View>
    </View>
  );

  const Meta = (
    <View style={[s.meta, layout === "vertical" && { alignItems: "center" }]}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.sub}>
        {value} / {target} {u}
      </Text>
    </View>
  );

  if (layout === "vertical") {
    return (
      <View style={s.vert}>
        {Ring}
        <View style={{ height: 6 }} />
        {Meta}
      </View>
    );
  }

  // horizontal (old behavior) – ring left, text right
  return (
    <View style={s.horiz}>
      {Ring}
      <View style={{ width: 12 }} />
      {Meta}
    </View>
  );
}

const s = StyleSheet.create({
  horiz: { flexDirection: "row", alignItems: "center" },
  vert: { alignItems: "center" },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: { color: "#feffffff", fontWeight: "700" },
  meta: {},
  label: { color: "white", fontWeight: "700" },
  sub: { color: "#9AA8B4", marginTop: 2, fontSize: 12 },
});
