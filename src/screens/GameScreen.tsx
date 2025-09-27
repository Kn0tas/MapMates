import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useGameStore, ROUND_LIMIT } from "../context/gameStore";
import { CountryMap } from "../components/CountryMap";
import { OptionButton } from "../components/OptionButton";
import { RoundControls } from "../components/RoundControls";
import { ScoreBoard } from "../components/ScoreBoard";
import { RootStackParamList } from "../navigation/types";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export const GameScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const {
    status,
    target,
    options,
    round,
    score,
    highScore,
    streak,
    autoAdvanceReason,
    initGame,
    submitGuess,
    nextRound,
    acknowledgeAutoAdvance,
  } = useGameStore((state) => ({
    status: state.status,
    target: state.target,
    options: state.options,
    round: state.round,
    score: state.score,
    highScore: state.highScore,
    streak: state.streak,
    autoAdvanceReason: state.autoAdvanceReason,
    initGame: state.initGame,
    submitGuess: state.submitGuess,
    nextRound: state.nextRound,
    acknowledgeAutoAdvance: state.acknowledgeAutoAdvance,
  }));
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

    if (status === "complete") {
      const highNote = score === highScore && score > 0 ? " New high score!" : "";
      return `Great job! Final score: ${score}.${highNote}`;
    }

    if (status === "revealed" && autoAdvanceReason === "fail-streak") {
      return `That's ${target.name}. Four misses in a row, moving on.`;
    }

    if (selection === target.code) {
      return `Correct! It's ${target.name}.`;
    }

    if (selection) {
      const chosen = options.find((option) => option.code === selection);
      return `It's ${target.name}. You picked ${chosen?.name ?? "another country"}.`;
    }

    return `It's ${target.name}.`;
  }, [status, target, selection, options, score, highScore, autoAdvanceReason]);

  const handleAdvance = () => {
    if (status === "revealed") {
      acknowledgeAutoAdvance();
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
            <View style={styles.headerRow}>
              <Text style={styles.title}>MapMates</Text>
              <Pressable
                hitSlop={8}
                style={styles.menuButton}
                onPress={(event) => {
                  event.stopPropagation();
                  navigation.navigate("Menu");
                }}
              >
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </Pressable>
            </View>
            <View style={styles.scoreWrapper}>
              <ScoreBoard
                round={round}
                score={score}
                streak={streak}
                roundLimit={ROUND_LIMIT}
                highScore={highScore}
              />
            </View>
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

          <RoundControls status={status} autoAdvanceReason={autoAdvanceReason} />
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 0.8,
  },
  menuButton: {
    width: 32,
    height: 22,
    justifyContent: "space-between",
  },
  menuLine: {
    height: 4,
    borderRadius: 4,
    backgroundColor: "#f8fafc",
  },
  scoreWrapper: {
    alignSelf: "stretch",
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
