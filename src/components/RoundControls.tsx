import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { RoundStatus } from "../types/country";

type RoundControlsProps = {
  status: RoundStatus;
};

export const RoundControls: React.FC<RoundControlsProps> = ({ status }) => {
  if (status === "playing") {
    return null;
  }

  return (
    <View style={styles.hint}>
      <Text style={styles.hintText}>Tap anywhere to continue</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  hint: {
    alignItems: "center",
    marginTop: 12,
  },
  hintText: {
    color: "#94a3b8",
    fontSize: 14,
    letterSpacing: 0.4,
  },
});