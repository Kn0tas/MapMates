import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "MultiplayerHome">;

export const MultiplayerHomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Play with friends</Text>
        <Text style={styles.subtitle}>
          Host a lobby to get a sharable code, or join an existing room using your
          nickname.
        </Text>

        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("MultiplayerCreate")}
        >
          <Text style={styles.buttonText}>Create Game</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("MultiplayerJoin")}
        >
          <Text style={styles.buttonText}>Join Game</Text>
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
    gap: 20,
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
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
  },
  secondaryButton: {
    backgroundColor: "#1f2a44",
  },
  buttonText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
});
