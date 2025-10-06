import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  CampaignGoal,
  CampaignStage,
  campaignStages,
  campaignStageMap,
} from "../data/campaign";
import { useCampaignStore, getStageStatus } from "../context/campaignStore";
import { formatAccuracy } from "../utils/campaign";
import { RootStackParamList } from "../navigation/types";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const CONTINENT_ORDER: CampaignStage["continent"][] = [
  "Europe",
  "Americas",
  "Africa",
  "Asia",
  "Global",
];

const describeGoalProgress = (
  goal: CampaignGoal,
  bestCorrect: number,
  bestAccuracy: number,
  bestStreak: number
): string => {
  switch (goal.type) {
    case "correct":
      return `${Math.min(bestCorrect, goal.target)}/${goal.target} best`;
    case "accuracy":
      return `Best ${formatAccuracy(bestAccuracy)}`;
    case "streak":
      return `${Math.min(bestStreak, goal.target)}/${goal.target} streak`;
    default:
      return "";
  }
};

export const CampaignScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const stageProgress = useCampaignStore((state) => state.stageProgress);

  const completedCount = useMemo(
    () => campaignStages.filter((stage) => stageProgress[stage.id]?.completed).length,
    [stageProgress]
  );

  const groupedStages = useMemo(() => {
    const groups = new Map<CampaignStage["continent"], CampaignStage[]>();

    campaignStages.forEach((stage) => {
      const current = groups.get(stage.continent) ?? [];
      current.push(stage);
      groups.set(stage.continent, current);
    });

    return CONTINENT_ORDER
      .map((continent) => ({
        continent,
        stages: groups.get(continent) ?? [],
      }))
      .filter((entry) => entry.stages.length > 0);
  }, []);

  const handleLaunchStage = (stageId: string) => {
    navigation.navigate("Game", { campaignStageId: stageId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Campaign</Text>
          <Text style={styles.heroSubtitle}>
            Guided missions to build world mastery one region at a time.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Stages cleared</Text>
              <Text style={styles.statValue}>
                {completedCount}/{campaignStages.length}
              </Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Active tip</Text>
              <Text style={styles.statValue}>
                Meet every objective to unlock the next tier.
              </Text>
            </View>
          </View>
        </View>

        {groupedStages.map(({ continent, stages }) => (
          <View key={continent} style={styles.section}>
            <Text style={styles.sectionHeader}>{continent}</Text>
            <View style={styles.stageList}>
              {stages.map((stage) => {
                const progress = stageProgress[stage.id];
                const status = getStageStatus(stage, stageProgress);
                const prerequisites = stage.requires?.map((id) =>
                  campaignStageMap.get(id)?.title ?? "Unknown stage"
                );
                const achievedGoals = new Set(progress?.completedGoalIds ?? []);

                return (
                  <View key={stage.id} style={styles.stageCard}>
                    <View style={styles.stageHeader}>
                      <View style={styles.stageTitleBlock}>
                        <Text style={styles.stageTitle}>{stage.title}</Text>
                        <Text style={styles.stageSubtitle}>{stage.subtitle}</Text>
                      </View>
                      <Text style={[styles.stageBadge, badgeStyles[stage.difficulty]]}>
                        {stage.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.stageDescription}>{stage.description}</Text>
                    <Text style={styles.stageMentor}>{stage.mentorLine}</Text>

                    <View style={styles.skillRow}>
                      {stage.focusSkills.map((skill) => (
                        <View key={skill} style={styles.skillPill}>
                          <Text style={styles.skillPillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.goalList}>
                      {stage.goals.map((goal) => {
                        const achieved = progress?.completed
                          ? true
                          : achievedGoals.has(goal.id);
                        const bestCorrect = progress?.bestCorrect ?? 0;
                        const bestAccuracy = progress?.bestAccuracy ?? 0;
                        const bestStreak = progress?.bestStreak ?? 0;
                        const progressText = describeGoalProgress(
                          goal,
                          bestCorrect,
                          bestAccuracy,
                          bestStreak
                        );

                        return (
                          <View key={goal.id} style={styles.goalItem}>
                            <Text
                              style={[
                                styles.goalStatus,
                                achieved ? styles.goalCompleted : styles.goalPending,
                              ]}
                            >
                              {achieved ? "[x]" : "[ ]"}
                            </Text>
                            <View style={styles.goalTextBlock}>
                              <Text style={styles.goalLabel}>{goal.label}</Text>
                              <Text style={styles.goalProgress}>{progressText}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.footerRow}>
                      <View style={styles.footerTextBlock}>
                        <Text style={styles.rewardLabel}>Reward</Text>
                        <Text style={styles.rewardText}>{stage.reward}</Text>
                      </View>
                      <Pressable
                        style={[
                          styles.stageButton,
                          status === "locked" ? styles.stageButtonDisabled : undefined,
                        ]}
                        disabled={status === "locked"}
                        onPress={() => handleLaunchStage(stage.id)}
                      >
                        <Text style={styles.stageButtonText}>
                          {status === "completed"
                            ? "Replay mission"
                            : status === "available"
                            ? "Start mission"
                            : "Locked"}
                        </Text>
                      </Pressable>
                    </View>

                    {status === "locked" && prerequisites && (
                      <Text style={styles.prerequisiteText}>
                        Unlock by completing {prerequisites.join(" and ")}
                      </Text>
                    )}

                    {progress?.lastResult && status !== "locked" && (
                      <Text style={styles.lastResultText}>
                        Last run: {progress.lastResult.correct}/{progress.lastResult.total} correct -
                        {" "}
                        {formatAccuracy(progress.lastResult.accuracy)} accuracy
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const badgeStyles = StyleSheet.create({
  intro: {
    backgroundColor: "#1e293b",
    color: "#38bdf8",
  },
  standard: {
    backgroundColor: "#1d4ed8",
    color: "#bfdbfe",
  },
  advanced: {
    backgroundColor: "#7c3aed",
    color: "#ede9fe",
  },
  expert: {
    backgroundColor: "#be123c",
    color: "#ffe4e6",
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  content: {
    padding: 24,
    gap: 32,
  },
  hero: {
    gap: 16,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#f8fafc",
  },
  heroSubtitle: {
    color: "#cbd5f5",
    fontSize: 16,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  statBlock: {
    flexBasis: "48%",
    backgroundColor: "#111c33",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e2e8f0",
    letterSpacing: 0.5,
  },
  stageList: {
    gap: 16,
  },
  stageCard: {
    backgroundColor: "#111c33",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 14,
  },
  stageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  stageTitleBlock: {
    flex: 1,
    gap: 4,
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
  },
  stageSubtitle: {
    color: "#cbd5f5",
  },
  stageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    textAlign: "center",
  },
  stageDescription: {
    color: "#e2e8f0",
    lineHeight: 20,
  },
  stageMentor: {
    color: "#94a3b8",
    fontStyle: "italic",
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillPill: {
    backgroundColor: "#1e293b",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  skillPillText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  goalList: {
    gap: 10,
  },
  goalItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  goalStatus: {
    fontSize: 14,
    marginTop: 2,
    width: 32,
  },
  goalCompleted: {
    color: "#4ade80",
  },
  goalPending: {
    color: "#64748b",
  },
  goalTextBlock: {
    flex: 1,
    gap: 4,
  },
  goalLabel: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  goalProgress: {
    color: "#94a3b8",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  footerTextBlock: {
    flex: 1,
    gap: 4,
  },
  rewardLabel: {
    color: "#64748b",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  rewardText: {
    color: "#cbd5f5",
    fontSize: 14,
  },
  stageButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stageButtonDisabled: {
    backgroundColor: "#1f2937",
  },
  stageButtonText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  prerequisiteText: {
    color: "#f97316",
    fontSize: 12,
  },
  lastResultText: {
    color: "#64748b",
    fontSize: 12,
  },
});
