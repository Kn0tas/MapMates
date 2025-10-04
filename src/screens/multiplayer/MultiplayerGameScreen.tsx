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

  const me = useMemo(() => game?.players.find((player) => player.id === meId), [game, meId]);
  const targetCountry = useMemo(() => findCountryByCode(game?.targetCode ?? null), [game?.targetCode]);
  const [now, setNow] = useState(Date.now());

  const selectionCounts = useMemo(() => {
    if (!game) {
      return new Map<string, number>();
    }
    const counts = new Map<string, number>();
    game.players.forEach((player) => {
      if (!player.connected) {
        return;
      }
      if (!player.lastChoice) {
        return;
      }
      counts.set(player.lastChoice, (counts.get(player.lastChoice) ?? 0) + 1);
    });
    return counts;
  }, [game]);

  useEffect(() => {
    if (!game) {
      navigation.navigate("MultiplayerHome");
      return;
    }
    if (game.state === "complete") {
      navigation.navigate("MultiplayerResults");
    }
  }, [game, navigation]);

  useEffect(() => {
    if (game?.state !== "playing" || !game?.timerEndsAt) {
      return;
    }
    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, [game?.timerEndsAt, game?.state]);

  const timeRemaining = useMemo(() => {
    if (!game || !game.timerEndsAt || game.state !== "playing") {
      return null;
    }
    const delta = Math.max(0, game.timerEndsAt - now);
    return Math.max(0, Math.ceil(delta / 1000));
  }, [game?.timerEndsAt, game?.state, now]);

  const message = useMemo(() => {
    if (!game) {
      return "Connecting to lobby...";
    }
    switch (game.state) {
      case "playing":
        return "Which country is highlighted?";
      case "revealed":
        return `It was ${game.targetName ?? "the correct country"}.`;
      case "complete":
        return "20 rounds complete!";
      default:
        return "Waiting for the next round...";
    }
  }, [game]);

  const isInteractive = game?.state === "playing";

  if (!game) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.message}>Connecting to multiplayer server…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>MapMates</Text>
          <Text style={styles.subtitle}>
            Round {game.round}/{game.maxRounds} · Players: {game.players.length}
          </Text>
        </View>

        <View style={styles.mapSection}>
          <View style={styles.mapWrapper}>
            {targetCountry ? <CountryMap target={targetCountry} /> : null}
            {game.state === "playing" && timeRemaining !== null ? (
              <View style={styles.timerBadge}>
                <Text style={styles.timerLabel}>Time left: {timeRemaining}s</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.prompt}>{message}</Text>
        </View>

        <View style={styles.optionsSection}>
          {game.options.map((option) => {
            const isCorrect = game.state === "revealed" && option.code === game.targetCode;
            const isMyChoice = me?.lastChoice === option.code;
            const isWrong = game.state === "revealed" && isMyChoice && !isCorrect;
            const isPendingSelection = game.state === "playing" && isMyChoice;
            const badgeCount =
              game.state === "playing"
                ? selectionCounts.get(option.code) ?? 0
                : 0;

            return (
              <OptionButton
                key={option.code}
                label={option.name}
                isCorrect={isCorrect}
                isSelected={false}
                isWrong={isWrong}
                disabled={!isInteractive}
                badgeCount={badgeCount}
                isPending={isPendingSelection}
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
    paddingBottom: 8,
    gap: 12,
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
    gap: 16,
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
  mapWrapper: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  timerBadge: {
    position: "absolute",
    bottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "#fbbf24",
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

