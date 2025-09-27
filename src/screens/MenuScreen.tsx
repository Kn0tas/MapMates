import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../navigation/types";

export const MenuScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Menu">> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate("MultiplayerHome")}
        >
          <Text style={styles.menuButtonText}>Multiplayer</Text>
        </Pressable>
        <Pressable
          style={styles.menuButton}
          onPress={() => navigation.navigate("MapSettings")}
        >
          <Text style={styles.menuButtonText}>Map settings</Text>
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
  menuButton: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  menuButtonText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
});
