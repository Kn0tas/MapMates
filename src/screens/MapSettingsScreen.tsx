import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/types";
import { useGameStore, RegionFilter } from "../context/gameStore";

const options: Array<{ key: Exclude<RegionFilter, "all">; label: string }> = [
  { key: "europe", label: "Europe" },
  { key: "americas", label: "America" },
  { key: "asiaOceania", label: "Asia & Oceania" },
  { key: "africa", label: "Africa" },
];

type Props = NativeStackScreenProps<RootStackParamList, "MapSettings">;

export const MapSettingsScreen: React.FC<Props> = () => {
  const regionFilter = useGameStore((state) => state.regionFilter);
  const setRegionFilter = useGameStore((state) => state.setRegionFilter);

  const handleSelect = (filter: Exclude<RegionFilter, "all">) => {
    if (regionFilter === filter) {
      setRegionFilter("all");
      return;
    }
    setRegionFilter(filter);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.subtitle}>Choose the continent you want to practice:</Text>
        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = regionFilter === option.key;
            return (
              <Pressable
                key={option.key}
                style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                onPress={() => handleSelect(option.key)}
              >
                <Text
                  style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.tip}>
          Tap a region to filter new rounds. Tap the highlighted region again to
          return to all countries.
        </Text>
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
  subtitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  options: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#1f2a44",
    alignItems: "center",
  },
  optionButtonSelected: {
    backgroundColor: "#2563eb",
  },
  optionLabel: {
    color: "#cbd5f5",
    fontSize: 16,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: "#f8fafc",
  },
  tip: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
});