import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type OptionButtonProps = {
  label: string;
  isCorrect: boolean;
  isSelected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  isCorrect,
  isSelected,
  disabled,
  onPress,
}) => {
  const backgroundColor = isCorrect
    ? "#22c55e"
    : isSelected
    ? "#ef4444"
    : "#1d4ed8";

  const opacity = disabled && !isSelected && !isCorrect ? 0.6 : 1;

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
});