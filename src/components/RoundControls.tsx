import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RoundStatus } from "../types/country";

type RoundControlsProps = {
  status: RoundStatus;
  onReveal: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export const RoundControls: React.FC<RoundControlsProps> = ({
  status,
  onReveal,
  onNext: _onNext,
  onSkip,
}) => {
  if (status === "playing") {
    return (
      <View style={styles.row}>
        <Pressable
          style={[styles.button, styles.rowButton, styles.reveal]}
          onPress={onReveal}
        >
          <Text style={styles.buttonText}>Reveal</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.rowButton, styles.skip]}
          onPress={onSkip}
        >
          <Text style={styles.buttonText}>Skip</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.tapHint}>
      <Text style={styles.hintText}>Tap anywhere to continue</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  rowButton: {
    flex: 1,
  },
  reveal: {
    backgroundColor: "#38bdf8",
  },
  skip: {
    backgroundColor: "#f97316",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
  tapHint: {
    alignItems: "center",
    marginTop: 12,
  },
  hintText: {
    color: "#94a3b8",
    fontSize: 14,
    letterSpacing: 0.4,
  },
});