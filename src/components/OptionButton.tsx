import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type OptionButtonProps = {
  label: string;
  isCorrect: boolean;
  isSelected: boolean;
  disabled?: boolean;
  badgeCount?: number;
  onPress: () => void;
};

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  isCorrect,
  isSelected,
  disabled,
  badgeCount,
  onPress,
}) => {
  const backgroundColor = isCorrect
    ? "#22c55e"
    : isSelected
    ? "#ef4444"
    : "#1d4ed8";

  const opacity = disabled && !isSelected && !isCorrect ? 0.6 : 1;

  const badgeLabel =
    typeof badgeCount === "number" && badgeCount > 0
      ? `\u2713${badgeCount}`
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          opacity: pressed ? opacity * 0.8 : opacity,
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {badgeLabel ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    right: -10,
    top: "50%",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0b1120",
    marginTop: -16,
  },
  badgeText: {
    color: "#f0fdfa",
    fontSize: 12,
    fontWeight: "800",
  },
});
