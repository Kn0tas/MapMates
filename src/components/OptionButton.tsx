import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type OptionButtonProps = {
  label: string;
  isCorrect: boolean;
  isSelected: boolean;
  isWrong?: boolean;
  disabled?: boolean;
  badgeCount?: number;
  onPress: () => void;
  isPending?: boolean;
};

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  isCorrect,
  isSelected,
  isWrong,
  disabled,
  badgeCount,
  onPress,
  isPending,
}) => {
  const backgroundColor = isCorrect
    ? "#22c55e"
    : isWrong
    ? "#ef4444"
    : isPending
    ? "#facc15"
    : isSelected
    ? "#ef4444"
    : "#1d4ed8";

  const opacity =
    disabled && !isSelected && !isCorrect && !isWrong && !isPending ? 0.6 : 1;

  const showBadge = typeof badgeCount === "number" && badgeCount > 0;

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
      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeCheck}>{'\u2713'}</Text>
          <View style={styles.badgeCounter}>
            <Text style={styles.badgeCounterText}>{badgeCount}</Text>
          </View>
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
    right: -8,
    top: "50%",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0b1120",
    marginTop: -18,
  },
  badgeCheck: {
    color: "#f0fdfa",
    fontSize: 18,
    fontWeight: "800",
  },
  badgeCounter: {
    position: "absolute",
    bottom: -4,
    right: -4,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#22d3ee",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#0b1120",
  },
  badgeCounterText: {
    color: "#0b1120",
    fontSize: 12,
    fontWeight: "700",
  },
});
