import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGameStore } from "../context/gameStore";
import { CountryMap } from "../components/CountryMap";
import { OptionButton } from "../components/OptionButton";
import { RoundControls } from "../components/RoundControls";
import { ScoreBoard } from "../components/ScoreBoard";

export const GameScreen: React.FC = () => {
  const {
    status,
    target,
    options,
    round,
    score,
    streak,
    initGame,
    submitGuess,
    nextRound,} = useGameStore();

  const [selection, setSelection] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") {
      initGame();
    }
  }, [status, initGame]);

  useEffect(() => {
    setSelection(null);
  }, [round, target?.code]);

  const message = useMemo(() => {
    if (!target) {
      return "Loading round...";
    }

    if (status === "playing") {
      return "Which country is highlighted?";
    }

    if (selection === target.code) {
      return `Correct! It\'s ${target.name}.`;
    }

    if (selection) {
      const chosen = options.find((option) => option.code === selection);
      return `It\'s ${target.name}. You picked ${chosen?.name ?? "another country"}.`;
    }

    return `It\'s ${target.name}.`;
  }, [status, target, selection, options]);

  const handleAdvance = () => {
    if (status === "revealed") {
      nextRound();
    } else if (status === "idle" || status === "complete") {
      initGame();
    }
  };

  if (!target) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.message}>Preparing your next round...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable
        style={styles.touchWrapper}
        onPress={handleAdvance}
        disabled={status === "playing"}
      >
        <View style={styles.container} pointerEvents="box-none">
          <View style={styles.header}>
            <Text style={styles.title}>MapMates v1.1</Text>
            <ScoreBoard round={round} score={score} streak={streak} />
          </View>

          <View style={styles.mapSection}>
            <CountryMap target={target} />
            <Text style={styles.prompt}>{message}</Text>
          </View>

          <View style={styles.optionsSection}>
            {options.map((option) => {
              const isSelected = selection === option.code;
              const isCorrect = status !== "playing" && option.code === target.code;

              return (
                <OptionButton
                  key={option.code}
                  label={option.name}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                  disabled={status !== "playing"}
                  onPress={() => {
                    if (status !== "playing") {
                      return;
                    }
                    setSelection(option.code);
                    submitGuess(option.code);
                  }}
                />
              );
            })}
          </View>

          <RoundControls status={status} />
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  touchWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    justifyContent: "space-between",
    gap: 12,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    textAlign: "center",
    letterSpacing: 0.8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1120",
  },
  mapSection: {
    gap: 10,
  },
  prompt: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
    textAlign: "center",
  },
  optionsSection: {
    marginTop: 4,
  },
  message: {
    fontSize: 18,
    color: "#e2e8f0",
  },
});