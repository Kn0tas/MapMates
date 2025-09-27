import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { MultiplayerPlayer } from "../types/multiplayer";

type MultiplayerPlayerListProps = {
  players: MultiplayerPlayer[];
  focusPlayerId?: string;
  showStatus?: boolean;
  showScores?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  lobby: "Ready",
  playing: "Guessing",
  answered: "Locked in",
  pending: "Voting",
  correct: "Correct",
  disconnected: "Disconnected",
  voting: "Voting",
  revealed: "Revealed",
};

export const MultiplayerPlayerList: React.FC<MultiplayerPlayerListProps> = ({
  players,
  focusPlayerId,
  showStatus = true,
  showScores = true,
}) => {
  if (!players.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {players.map((player) => {
        const statusLabel = STATUS_LABEL[player.status] ?? player.status;
        const isFocused = player.id === focusPlayerId;
        const indicatorColor = player.isHost ? "#facc15" : "#38bdf8";
        const needsDecision = player.needsHostDecision;

        return (
          <View
            key={player.id}
            style={[styles.row, isFocused && styles.focusRow]}
          >
            <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text style={styles.nickname} numberOfLines={1}>
                  {player.nickname}
                  {player.isHost ? " (Host)" : ""}
                </Text>
                {showScores ? (
                  <Text style={styles.score}>{player.score}</Text>
                ) : null}
              </View>
              {showStatus ? (
                <Text
                  style={[
                    styles.status,
                    player.connected ? undefined : styles.disconnected,
                  ]}
                >
                  {needsDecision ? "Awaiting host" : statusLabel}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111c33",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  focusRow: {
    borderWidth: 2,
    borderColor: "#38bdf8",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nickname: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    marginRight: 12,
  },
  score: {
    color: "#a5b4fc",
    fontSize: 16,
    fontWeight: "700",
  },
  status: {
    color: "#94a3b8",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  disconnected: {
    color: "#f97316",
  },
});
