import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { RoundStatus } from "../types/country";

type RoundControlsProps = {
  status: RoundStatus;
  autoAdvanceReason?: "fail-streak";
};

export const RoundControls: React.FC<RoundControlsProps> = ({ status, autoAdvanceReason }) => {
  if (status === "playing") {
    return null;
  }

  const hintText =
    autoAdvanceReason === "fail-streak"
      ? "Four misses in a row, moving on..."
      : "Tap anywhere to continue";

  return (
    <View style={styles.hint} pointerEvents="none">
      <Text style={styles.hintText}>{hintText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  hint: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.4,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});