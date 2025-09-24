import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { countryByCode } from "../data/countries";

type NeighborPillsProps = {
  codes: string[];
};

export const NeighborPills: React.FC<NeighborPillsProps> = ({ codes }) => {
  if (!codes.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {codes.map((code) => {
        const country = countryByCode[code];
        return (
          <View key={`neighbor-pill-${code}`} style={styles.pill}>
            <Text style={styles.text}>{country?.name ?? code}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#cbd5f5",
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontWeight: "600",
    color: "#1e293b",
  },
});