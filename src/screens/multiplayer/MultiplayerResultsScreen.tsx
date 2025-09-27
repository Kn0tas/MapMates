import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useMultiplayerStore } from "../../context/multiplayerStore";
import { RootStackParamList } from "../../navigation/types";
import { MultiplayerPlayerList } from "../../components/MultiplayerPlayerList";

type Props = NativeStackScreenProps<RootStackParamList, "MultiplayerResults">;

export const MultiplayerResultsScreen: React.FC<Props> = ({ navigation }) => {
  const { game } = useMultiplayerStore((state) => ({ game: state.game }));

  useEffect(() => {
    if (!game) {
      navigation.navigate("MultiplayerHome");
      return;
    }
    if (game.state !== "complete") {
      navigation.navigate("MultiplayerGame");
    }
  }, [game, navigation]);

  const winners = useMemo(() => {
    if (!game || !game.mvpIds.length) {
      return [];
    }
    return game.players
      .filter((player) => game.mvpIds.includes(player.id))
      .sort((a, b) => b.score - a.score);
  }, [game]);

  if (!game) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>MVPs</Text>
        {winners.length ? (
          <View style={styles.winnerCard}>
            {winners.map((player) => (
              <Text key={player.id} style={styles.winnerName}>
                {player.nickname} · {player.score}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.subtitle}>No MVPs this time — play another round!</Text>
        )}

        <Text style={styles.sectionTitle}>Final scoreboard</Text>
        <MultiplayerPlayerList
          players={[...game.players].sort((a, b) => b.score - a.score)}
          showStatus={false}
        />

        <View style={styles.footer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("MultiplayerLobby")}
          >
            <Text style={styles.buttonText}>Return to lobby</Text>
          </Pressable>
        </View>
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
    padding: 24,
    gap: 20,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5f5",
    fontSize: 15,
  },
  sectionTitle: {
    color: "#cbd5f5",
    fontSize: 16,
    fontWeight: "700",
  },
  winnerCard: {
    backgroundColor: "#1d4ed8",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  winnerName: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    marginTop: "auto",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
});
