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
  onNext,
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
    <Pressable style={[styles.button, styles.next]} onPress={onNext}>
      <Text style={styles.buttonText}>Next Round</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  rowButton: {
    flex: 1,
    marginTop: 0,
  },
  reveal: {
    backgroundColor: "#38bdf8",
    marginRight: 10,
  },
  skip: {
    backgroundColor: "#f97316",
  },
  next: {
    backgroundColor: "#22c55e",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
});