import React, { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useMultiplayerStore } from "../../context/multiplayerStore";
import { RootStackParamList } from "../../navigation/types";
import { RegionFilter } from "../../context/gameStore";
import { MultiplayerPlayerList } from "../../components/MultiplayerPlayerList";

const REGION_OPTIONS: Array<{ key: RegionFilter | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "europe", label: "Europe" },
  { key: "americas", label: "Americas" },
  { key: "asiaOceania", label: "Asia/Oceania" },
  { key: "africa", label: "Africa" },
];

type Props = NativeStackScreenProps<RootStackParamList, "MultiplayerLobby">;

export const MultiplayerLobbyScreen: React.FC<Props> = ({ navigation }) => {
  const {
    game,
    status,
    meId,
    leaveGame,
    setRegionFilter,
    resolveDisconnect,
    startGame,
  } = useMultiplayerStore((state) => ({
    game: state.game,
    status: state.status,
    meId: state.meId,
    leaveGame: state.leaveGame,
    setRegionFilter: state.setRegionFilter,
    resolveDisconnect: state.resolveDisconnect,
    startGame: state.startGame,
  }));

  const isHost = useMemo(() => {
    if (!game || !meId) {
      return false;
    }
    return game.players.some((player) => player.id === meId && player.isHost);
  }, [game, meId]);

  useEffect(() => {
    if (!game) {
      navigation.navigate("MultiplayerHome");
      return;
    }
    if (game.state !== "lobby") {
      navigation.navigate("MultiplayerGame");
    }
  }, [game, navigation]);

  const pendingDecisions = useMemo(
    () => game?.players.filter((player) => player.needsHostDecision) ?? [],
    [game?.players]
  );

  if (!game) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{game.name}</Text>
          <View style={styles.codePill}>
            <Text style={styles.codeLabel}>Code</Text>
            <Text style={styles.codeValue}>{game.code}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players</Text>
          <MultiplayerPlayerList
            players={game.players}
            focusPlayerId={meId}
            showScores={false}
          />
        </View>

        {isHost ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Region filter</Text>
            <View style={styles.regionRow}>
              {REGION_OPTIONS.map((option) => {
                const selected = game.regionFilter === option.key;
                return (
                  <Pressable
                    key={option.key}
                    style={[styles.regionChip, selected && styles.regionChipSelected]}
                    onPress={() => setRegionFilter(option.key)}
                  >
                    <Text
                      style={[styles.regionText, selected && styles.regionTextSelected]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {isHost && pendingDecisions.length ? (
          <View style={styles.notice}>
            {pendingDecisions.map((player) => (
              <View key={player.id} style={styles.noticeRow}>
                <View style={styles.noticeTextBlock}>
                  <Text style={styles.noticeTitle}>{player.nickname} disconnected</Text>
                  <Text style={styles.noticeSubtitle}>
                    Kick them now or wait 20 seconds to see if they rejoin.
                  </Text>
                </View>
                <View style={styles.noticeButtons}>
                  <Pressable
                    style={[styles.noticeButton, styles.kickButton]}
                    onPress={() => resolveDisconnect(player.id, "kick")}
                  >
                    <Text style={styles.noticeButtonText}>Kick</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.noticeButton, styles.waitButton]}
                    onPress={() => resolveDisconnect(player.id, "wait")}
                  >
                    <Text style={styles.noticeButtonText}>Wait 20s</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <Pressable style={styles.secondaryButton} onPress={async () => { await leaveGame(); navigation.navigate("MultiplayerHome"); }}>
            <Text style={styles.secondaryText}>Leave lobby</Text>
          </Pressable>
          {isHost ? (
            <Pressable
              style={[styles.primaryButton, status !== "lobby" && styles.disabledButton]}
              onPress={() => startGame()}
            >
              <Text style={styles.primaryText}>Start game</Text>
            </Pressable>
          ) : (
            <Text style={styles.waitingText}>Waiting for the host to start…</Text>
          )}
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
    gap: 24,
  },
  header: {
    gap: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 26,
    fontWeight: "800",
  },
  codePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#1d4ed8",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    gap: 8,
  },
  codeLabel: {
    color: "#cbd5f5",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  codeValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "800",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "#cbd5f5",
    fontSize: 16,
    fontWeight: "700",
  },
  regionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  regionChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#111c33",
  },
  regionChipSelected: {
    backgroundColor: "#2563eb",
  },
  regionText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  regionTextSelected: {
    color: "#f8fafc",
  },
  notice: {
    gap: 16,
    backgroundColor: "#1f2a44",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1d4ed8",
  },
  noticeRow: {
    gap: 12,
  },
  noticeTextBlock: {
    gap: 4,
  },
  noticeTitle: {
    color: "#fbbf24",
    fontSize: 15,
    fontWeight: "700",
  },
  noticeSubtitle: {
    color: "#cbd5f5",
    fontSize: 13,
    lineHeight: 18,
  },
  noticeButtons: {
    flexDirection: "row",
    gap: 10,
  },
  noticeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  kickButton: {
    backgroundColor: "#ef4444",
  },
  waitButton: {
    backgroundColor: "#16a34a",
  },
  noticeButtonText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#111c33",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  waitingText: {
    flex: 1,
    color: "#cbd5f5",
    fontSize: 14,
  },
});

