import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const CampaignScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Campaign</Text>
        <Text style={styles.subtitle}>Plan your learning journey</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming soon</Text>
          <Text style={styles.cardBody}>
            Tackle guided missions across the globe, level up your geography
            skills, and track your progress as new regions unlock.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  content: {
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f8fafc",
  },
  subtitle: {
    fontSize: 18,
    color: "#cbd5f5",
  },
  card: {
    backgroundColor: "#111c33",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 16,
    lineHeight: 22,
    color: "#94a3b8",
  },
});
