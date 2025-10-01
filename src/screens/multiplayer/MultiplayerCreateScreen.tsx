import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useMultiplayerStore } from "../../context/multiplayerStore";
import { RootStackParamList } from "../../navigation/types";
import { RegionFilter } from "../../context/gameStore";

const REGION_OPTIONS: Array<{ key: RegionFilter | "all"; label: string }> = [
  { key: "all", label: "All regions" },
  { key: "europe", label: "Europe" },
  { key: "americas", label: "Americas" },
  { key: "asiaOceania", label: "Asia & Oceania" },
  { key: "africa", label: "Africa" },
];

type Props = NativeStackScreenProps<RootStackParamList, "MultiplayerCreate">;

export const MultiplayerCreateScreen: React.FC<Props> = ({ navigation }) => {
  const {
    createGame,
    game,
    status,
    error,
    clearError,
  } = useMultiplayerStore((state) => ({
    createGame: state.createGame,
    game: state.game,
    status: state.status,
    error: state.error,
    clearError: state.clearError,
  }));
  const [nickname, setNickname] = useState("");
  const [gameName, setGameName] = useState("");
  const [regionFilter, setRegionFilter] = useState<RegionFilter | "all">("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (game && (status === "lobby" || status === "playing")) {
      navigation.navigate("MultiplayerLobby");
    }
  }, [game, navigation, status]);

  const canSubmit = useMemo(() => nickname.trim().length > 0, [nickname]);

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }
    setSubmitting(true);
    await createGame({ nickname: nickname.trim(), gameName: gameName.trim(), regionFilter });
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Create lobby</Text>
        <Text style={styles.subtitle}>
          Your lobby gets a short code that teammates can use to join. Pick a
          nickname so they know it is you.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Lobby name</Text>
          <TextInput
            placeholder="World Explorers"
            placeholderTextColor="#475569"
            style={styles.input}
            value={gameName}
            onChangeText={(value) => {
              clearError();
              setGameName(value);
            }}
            maxLength={40}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            placeholder="Cartographer91"
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

        <Text style={styles.label}>Region filter</Text>
        <View style={styles.regionRow}>
          {REGION_OPTIONS.map((option) => {
            const selected = regionFilter === option.key;
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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.submitText}>{submitting ? "Creating…" : "Create lobby"}</Text>
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
  error: {
    color: "#f87171",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: "#16a34a",
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
