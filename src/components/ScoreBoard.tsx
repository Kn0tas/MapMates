import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ScoreBoardProps = {
  round: number;
  score: number;
  streak: number;
};

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ round, score, streak }) => {
  return (
    <View style={styles.container}>
      <View style={styles.metric}>
        <Text style={styles.label}>Round</Text>
        <Text style={styles.value}>{round}</Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>{streak}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#0f172a",
    borderRadius: 16,
  },
  metric: {
    alignItems: "center",
  },
  label: {
    color: "#94a3b8",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  value: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
});