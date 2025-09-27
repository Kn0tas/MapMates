import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useMultiplayerStore } from "../../context/multiplayerStore";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "MultiplayerJoin">;

export const MultiplayerJoinScreen: React.FC<Props> = ({ navigation }) => {
  const { joinGame, game, status, error, clearError } = useMultiplayerStore((state) => ({
    joinGame: state.joinGame,
    game: state.game,
    status: state.status,
    error: state.error,
    clearError: state.clearError,
  }));
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (game && status !== "idle") {
      navigation.navigate("MultiplayerLobby");
    }
  }, [game, navigation, status]);

  const canSubmit = useMemo(() => {
    return code.trim().length >= 4 && nickname.trim().length > 0;
  }, [code, nickname]);

  const handleJoin = async () => {
    if (!canSubmit || submitting) {
      return;
    }
    setSubmitting(true);
    await joinGame({ code: code.trim(), nickname: nickname.trim() });
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Join lobby</Text>
        <Text style={styles.subtitle}>
          Enter the code shared by the host along with the nickname you want to appear on the scoreboard.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Lobby code</Text>
          <TextInput
            placeholder="ABCD"
            placeholderTextColor="#475569"
            style={styles.input}
            value={code}
            onChangeText={(value) => {
              clearError();
              setCode(value.toUpperCase());
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            placeholder="MapMaster"
            placeholderTextColor="#475569"
            style={styles.input}
            value={nickname}
            onChangeText={(value) => {
              clearError();
              setNickname(value);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
          onPress={handleJoin}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.submitText}>{submitting ? "Joining…" : "Join lobby"}</Text>
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
    padding: 24,
    gap: 18,
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#cbd5f5",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#111c33",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    color: "#f8fafc",
    fontSize: 16,
  },
  error: {
    color: "#f87171",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
});
