import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { CountryGeometry, RoundStatus } from "../types/country";

type CountryMapProps = {
  target: CountryGeometry;
  status: RoundStatus;
};

const COLORS = {
  target: "#2563eb",
  neighbor: "#94a3b8",
  background: "#e2e8f0",
  border: "#1f2937",
};

export const CountryMap: React.FC<CountryMapProps> = ({ target, status }) => {
  return (
    <View style={styles.wrapper}>
      <Svg viewBox={target.svg.viewBox} style={styles.svg}>
        {target.svg.shapes.map((shape) => {
          const isTarget = shape.code === target.code;
          const isNeighbor = target.neighbors.includes(shape.code);
          const fillColor = isTarget
            ? COLORS.target
            : isNeighbor
            ? COLORS.neighbor
            : COLORS.background;

          const opacity = status === "playing" && !isTarget ? 0.35 : 1;

          return (
            <Path
              key={`${target.code}-${shape.code}`}
              d={shape.path}
              fill={fillColor}
              fillOpacity={opacity}
              stroke={COLORS.border}
              strokeWidth={isTarget ? 3 : 1.5}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    aspectRatio: 1.3,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  svg: {
    flex: 1,
  },
});