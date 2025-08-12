import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

type Props = {
  label: string;
  value: number;
  target: number;
  size?: number; // outer size of the ring
  stroke?: number; // ring thickness
  showPercentInCenter?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
};

export default function MacroRing({
  label,
  value,
  target,
  size = 76,
  stroke = 10,
  showPercentInCenter = true,
  // purple → pink like your reference image
  gradientFrom = "#8B5CF6",
  gradientTo = "#EC4899",
}: Props) {
  const pct =
    target > 0
      ? Math.max(0, Math.min(100, Math.round((value / target) * 100)))
      : 0;

  const half = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <View style={s.row}>
      {/* Ring */}
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

      {/* Right-side labels (horizontal layout) */}
      <View style={s.meta}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.sub}>
          {value} / {target} {label === "Calories" ? "kcal" : "g"}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    color: "#334155",
    fontWeight: "700",
  },
  meta: { flex: 1 },
  label: { color: "white", fontWeight: "700" },
  sub: { color: "#9AA8B4", marginTop: 2 },
});
