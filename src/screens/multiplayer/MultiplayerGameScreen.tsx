import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CountryMap } from "../../components/CountryMap";
import { OptionButton } from "../../components/OptionButton";
import { MultiplayerPlayerList } from "../../components/MultiplayerPlayerList";
import { useMultiplayerStore } from "../../context/multiplayerStore";
import { RootStackParamList } from "../../navigation/types";
import { countries } from "../../data/countries";

const findCountryByCode = (code: string | null) => {
  if (!code) {
    return undefined;
  }
  return countries.find((item) => item.code === code);
};

type Props = NativeStackScreenProps<RootStackParamList, "MultiplayerGame">;

export const MultiplayerGameScreen: React.FC<Props> = ({ navigation }) => {
  const { game, status, meId, submitGuess } = useMultiplayerStore((state) => ({
    game: state.game,
    status: state.status,
    meId: state.meId,
    submitGuess: state.submitGuess,
  }));
  const [remainingMs, setRemainingMs] = useState(0);

  const me = useMemo(() => game?.players.find((player) => player.id === meId), [game, meId]);
  const targetCountry = useMemo(() => findCountryByCode(game?.targetCode ?? null), [game?.targetCode]);

  useEffect(() => {
    const deadline = game?.timerEndsAt ?? null;
    if (deadline) {
      const update = () => {
        setRemainingMs(Math.max(0, deadline - Date.now()));
      };
      update();
      const interval = setInterval(update, 250);
      return () => clearInterval(interval);
    }
    setRemainingMs(0);
  }, [game?.timerEndsAt]);

  useEffect(() => {
    if (!game) {
      navigation.navigate("MultiplayerHome");
      return;
    }
    if (game.state === "complete") {
      navigation.navigate("MultiplayerResults");
    }
  }, [game, navigation]);

  const message = useMemo(() => {
    if (!game) {
      return "Connecting to lobby...";
    }
    switch (game.state) {
      case "playing":
        return "Which country is highlighted?";
      case "voting":
        return "Players disagreed. Vote for the most likely answer.";
      case "revealed":
        return `It was ${game.targetName ?? "the correct country"}.`;
      case "complete":
        return "20 rounds complete!";
      default:
        return "Waiting for the next round...";
    }
  }, [game]);

  const isInteractive = game?.state === "playing" || game?.state === "voting";
  const secondsLeft = Math.ceil(remainingMs / 1000);

  if (!game) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.message}>Connecting to multiplayer server…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>MapMates</Text>
            <Text style={styles.subtitle}>
              Round {game.round}/{game.maxRounds}
            </Text>
          </View>
          <View style={styles.codePill}>
            <Text style={styles.codeLabel}>Code</Text>
            <Text style={styles.codeValue}>{game.code}</Text>
          </View>
        </View>

        <View style={styles.scorecard}>
          <MultiplayerPlayerList
            players={[...game.players].sort((a, b) => b.score - a.score)}
            focusPlayerId={meId}
          />
        </View>

        <View style={styles.mapSection}>
          {targetCountry ? <CountryMap target={targetCountry} /> : null}
          <Text style={styles.prompt}>{message}</Text>
          {secondsLeft > 0 && game.state === "voting" ? (
            <Text style={styles.timerLabel}>{secondsLeft}s left to vote</Text>
          ) : null}
        </View>

        <View style={styles.optionsSection}>
          {game.options.map((option) => {
            const isCorrect = game.state === "revealed" && option.code === game.targetCode;
            const isSelected = me?.lastChoice === option.code;
            const votes = game.voteCounts?.[option.code] ?? 0;
            return (
              <OptionButton
                key={option.code}
                label={option.name}
                isCorrect={isCorrect}
                isSelected={!!isSelected}
                disabled={!isInteractive}
                badgeCount={game.state === "voting" ? votes : 0}
                onPress={() => {
                  if (!isInteractive) {
                    return;
                  }
                  submitGuess(option.code);
                }}
              />
            );
          })}
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate("MultiplayerLobby")}
        >
          <Text style={styles.backText}>Back to lobby</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    color: "#cbd5f5",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  codePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  codeLabel: {
    color: "#cbd5f5",
    fontSize: 11,
    letterSpacing: 1,
  },
  codeValue: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  scorecard: {
    backgroundColor: "#111c33",
    borderRadius: 16,
    padding: 16,
  },
  mapSection: {
    alignItems: "center",
    gap: 10,
  },
  prompt: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  timerLabel: {
    color: "#fbbf24",
    fontSize: 14,
    fontWeight: "700",
  },
  optionsSection: {
    gap: 10,
  },
  backButton: {
    alignSelf: "center",
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2a44",
  },
  backText: {
    color: "#cbd5f5",
    fontSize: 14,
    fontWeight: "600",
  },
});
