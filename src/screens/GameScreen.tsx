import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
    nextRound,
    reveal,
    skipRound,
  } = useGameStore();

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

  if (!target) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.message}>Preparing your next round...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ScoreBoard round={round} score={score} streak={streak} />

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

        <RoundControls
          status={status}
          onReveal={reveal}
          onNext={nextRound}
          onSkip={skipRound}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 18,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1120",
  },
  mapSection: {
    gap: 12,
  },
  prompt: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
    textAlign: "center",
  },
  optionsSection: {
    marginTop: 6,
  },
  message: {
    fontSize: 18,
    color: "#e2e8f0",
  },
});