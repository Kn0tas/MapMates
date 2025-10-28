import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useStatesGameStore } from "../context/stateGameStore";
import { RootStackParamList } from "../navigation/types";
import { CountryMap } from "../components/CountryMap";
import { OptionButton } from "../components/OptionButton";
import { RoundControls } from "../components/RoundControls";
import { ScoreBoard } from "../components/ScoreBoard";

type Props = NativeStackScreenProps<RootStackParamList, "StatesGame">;

export const StatesGameScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    status,
    target,
    options,
    round,
    roundLimit,
    score,
    highScore,
    streak,
    initGame,
    submitGuess,
    nextRound,
  } = useStatesGameStore((state) => ({
    status: state.status,
    target: state.target,
    options: state.options,
    round: state.round,
    roundLimit: state.roundLimit,
    score: state.score,
    highScore: state.highScore,
    streak: state.streak,
    initGame: state.initGame,
    submitGuess: state.submitGuess,
    nextRound: state.nextRound,
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
      return "Which US state is highlighted?";
    }

    if (status === "complete") {
      const highNote = score === highScore && score > 0 ? " New high score!" : "";
      return `Nice work! Final score: ${score}.${highNote}`;
    }

    if (selection === target.code) {
      return `Correct! It's ${target.name}.`;
    }

    if (selection) {
      const chosen = options.find((option) => option.code === selection);
      return `It's ${target.name}. You picked ${chosen?.name ?? "another state"}.`;
    }

    return `It's ${target.name}.`;
  }, [status, target, selection, options, score, highScore]);

  const handleAdvance = () => {
    if (status === "playing") {
      return;
    }

    if (status === "revealed") {
      nextRound();
    } else if (status === "complete" || status === "idle") {
      initGame();
    }
  };

  const handleGuess = (stateCode: string) => {
    if (status !== "playing") {
      return;
    }
    setSelection(stateCode);
    submitGuess(stateCode);
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
      <Pressable style={styles.touchWrapper} onPress={handleAdvance}>
        <View
          style={[
            styles.container,
            { paddingBottom: 16 + Math.max(insets.bottom, 0) },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>USA States</Text>
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
          </View>

          <View style={styles.scoreWrapper}>
            <ScoreBoard
              round={round}
              score={score}
              streak={streak}
              roundLimit={roundLimit}
              highScore={highScore}
            />
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
                  onPress={() => handleGuess(option.code)}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
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
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1120",
  },
  message: {
    fontSize: 18,
    color: "#e2e8f0",
  },
});
