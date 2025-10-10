import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useGameStore } from "../context/gameStore";
import { useCampaignStore } from "../context/campaignStore";
import { getCampaignStage, resolveCountryPool } from "../data/campaign";
import { calculateCampaignResult, formatAccuracy } from "../utils/campaign";
import { CountryMap } from "../components/CountryMap";
import { OptionButton } from "../components/OptionButton";
import { RoundControls } from "../components/RoundControls";
import { ScoreBoard } from "../components/ScoreBoard";
import { RootStackParamList } from "../navigation/types";

import { RoundHistoryEntry } from "../types/country";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type GameRoute = RouteProp<RootStackParamList, "Game">;

export const GameScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<GameRoute>();
  const requestedStageId = route.params?.campaignStageId ?? null;
  const markAttempt = useCampaignStore((state) => state.markAttempt);
  const {
    mode,
    campaignStageId,
    status,
    target,
    options,
    round,
    roundLimit,
    score,
    highScore,
    streak,
    autoAdvanceReason,
    history,
    initGame,
    submitGuess,
    nextRound,
    acknowledgeAutoAdvance,
  } = useGameStore((state) => ({
    mode: state.mode,
    campaignStageId: state.campaignStageId,
    status: state.status,
    target: state.target,
    options: state.options,
    round: state.round,
    roundLimit: state.roundLimit,
    score: state.score,
    highScore: state.highScore,
    streak: state.streak,
    autoAdvanceReason: state.autoAdvanceReason,
    history: state.history,
    initGame: state.initGame,
    submitGuess: state.submitGuess,
    nextRound: state.nextRound,
    acknowledgeAutoAdvance: state.acknowledgeAutoAdvance,
  }));
  const [selection, setSelection] = useState<string | null>(null);
  const campaignStage = useMemo(() => {
    const activeId = campaignStageId ?? requestedStageId;
    return activeId ? getCampaignStage(activeId) : undefined;
  }, [campaignStageId, requestedStageId]);
  const lastRecordedHistoryRef = useRef<RoundHistoryEntry[] | null>(null);
  const isCampaignMode = mode === "campaign" && Boolean(campaignStage);

  useEffect(() => {
    if (!requestedStageId) {
      return;
    }
    const stage = getCampaignStage(requestedStageId);
    if (!stage) {
      return;
    }
    const pool = resolveCountryPool(stage.countryCodes);
    initGame({
      mode: "campaign",
      pool,
      roundLimit: stage.roundLimit,
      campaignStageId: stage.id,
    });
  }, [requestedStageId, initGame]);

  useEffect(() => {
    if (requestedStageId) {
      return;
    }
    if (status === "idle") {
      initGame();
    }
  }, [requestedStageId, status, initGame]);

  useEffect(() => {
    setSelection(null);
  }, [round, target?.code]);

  useEffect(() => {
    if (status === "playing") {
      lastRecordedHistoryRef.current = null;
    }
  }, [status]);

  const campaignSummary = useMemo(() => {
    if (!isCampaignMode || !campaignStage || status !== "complete") {
      return undefined;
    }
    return calculateCampaignResult(campaignStage, history);
  }, [isCampaignMode, campaignStage, status, history]);

  useEffect(() => {
    if (!campaignSummary || !campaignStage) {
      return;
    }
    if (lastRecordedHistoryRef.current === history) {
      return;
    }
    markAttempt(campaignSummary);
    lastRecordedHistoryRef.current = history;
  }, [campaignSummary, campaignStage, history, markAttempt]);

  const message = useMemo(() => {
    if (!target) {
      return "Loading round...";
    }

    if (status === "playing") {
      return isCampaignMode && campaignStage
        ? `Mission: ${campaignStage.title}`
        : "Which country is highlighted?";
    }

    if (status === "complete") {
      if (isCampaignMode && campaignStage) {
        return `Mission complete! Review your objectives for ${campaignStage.title}.`;
      }
      const highNote = score === highScore && score > 0 ? " New high score!" : "";
      return `Great job! Final score: ${score}.${highNote}`;
    }

    if (status === "revealed" && autoAdvanceReason === "fail-streak") {
      return `That's ${target.name}. Four misses in a row, moving on.`;
    }

    if (selection === target.code) {
      return `Correct! It's ${target.name}.`;
    }

    if (selection) {
      const chosen = options.find((option) => option.code === selection);
      return `It's ${target.name}. You picked ${chosen?.name ?? "another country"}.`;
    }

    return `It's ${target.name}.`;
  }, [status, target, selection, options, score, highScore, autoAdvanceReason, isCampaignMode, campaignStage]);

  const handleAdvance = () => {
    if (isCampaignMode && status === "complete") {
      return;
    }

    if (status === "revealed") {
      acknowledgeAutoAdvance();
      nextRound();
    } else if (status === "idle" || status === "complete") {
      initGame();
    }
  };

  const handleExitCampaign = (action: "campaign" | "replay") => {
    if (!campaignStage) {
      return;
    }

    if (action === "campaign") {
      navigation.setParams({ campaignStageId: undefined });
      initGame();
      navigation.navigate("Campaign");
    } else if (action === "replay") {
      const pool = resolveCountryPool(campaignStage.countryCodes);
      initGame({
        mode: "campaign",
        pool,
        roundLimit: campaignStage.roundLimit,
        campaignStageId: campaignStage.id,
      });
    }
  };

  if (!target) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.message}>Preparing your next round...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable
        style={styles.touchWrapper}
        onPress={handleAdvance}
        disabled={status === "playing" || (isCampaignMode && status === "complete")}
      >
        <View
          style={[
            styles.container,
            { paddingBottom: 16 + Math.max(insets.bottom, 0) },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>MapMates</Text>
              <Pressable
                hitSlop={8}
                style={styles.menuButton}
                onPress={(event) => {
                  event.stopPropagation();
                  navigation.navigate("Menu");
                }}
              >
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
              </Pressable>
            </View>
            {isCampaignMode && campaignStage ? (
              <View style={styles.campaignHeader}>
                <View style={styles.campaignTitleRow}>
                  <Text style={styles.campaignTitle}>{campaignStage.title}</Text>
                  <Text style={styles.campaignRoundCount}>
                    Round {round}/{roundLimit}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.scoreWrapper}>
                <ScoreBoard
                  round={round}
                  score={score}
                  streak={streak}
                  roundLimit={roundLimit}
                  highScore={highScore}
                />
              </View>
            )}
          </View>

          <View style={styles.mapSection}>
            <CountryMap target={target} />
            <Text style={styles.prompt}>{message}</Text>
          </View>

          <View style={styles.optionsSection}>
            {options.map((option) => {
              const isSelected = selection === option.code;
              const isCorrect = status !== "playing" && option.code === target.code;

              return (
                <OptionButton
                  key={option.code}
                  label={option.name}
                  isCorrect={isCorrect}
                  isSelected={isSelected}
                  disabled={status !== "playing"}
                  onPress={() => {
                    if (status !== "playing") {
                      return;
                    }
                    setSelection(option.code);
                    submitGuess(option.code);
                  }}
                />
              );
            })}
          </View>

          {!isCampaignMode && (
            <RoundControls status={status} autoAdvanceReason={autoAdvanceReason} />
          )}

          {isCampaignMode && campaignStage && status === "complete" && campaignSummary && (
            <View style={styles.campaignSummary}>
              <Text style={styles.summaryTitle}>Mission Debrief</Text>
              <Text style={styles.summarySubtitle}>{campaignStage.title}</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>Correct</Text>
                  <Text style={styles.summaryValue}>
                    {campaignSummary.correct}/{campaignSummary.total}
                  </Text>
                </View>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>Accuracy</Text>
                  <Text style={styles.summaryValue}>{formatAccuracy(campaignSummary.accuracy)}</Text>
                </View>
                <View style={styles.summaryBlock}>
                  <Text style={styles.summaryLabel}>Best streak</Text>
                  <Text style={styles.summaryValue}>{campaignSummary.bestStreak}</Text>
                </View>
              </View>

              <View style={styles.summaryGoals}>
                {campaignStage.goals.map((goal) => {
                  const achieved = campaignSummary.goalResults[goal.id];
                  return (
                    <View key={goal.id} style={styles.summaryGoal}>
                      <Text
                        style={[
                          styles.summaryGoalStatus,
                          achieved ? styles.goalCompleted : styles.goalPending,
                        ]}
                      >
                        {achieved ? "\u2714" : "\u2717"}
                      </Text>
                      <Text style={styles.summaryGoalText}>{goal.label}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.summaryButtons}>
                <Pressable
                  style={[styles.summaryButton, styles.summaryPrimary]}
                  onPress={() => handleExitCampaign("campaign")}
                >
                  <Text style={styles.summaryButtonText}>Back to campaign</Text>
                </Pressable>
                <Pressable
                  style={[styles.summaryButton, styles.summarySecondary]}
                  onPress={() => handleExitCampaign("replay")}
                >
                  <Text style={styles.summaryButtonText}>Replay mission</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  touchWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    justifyContent: "space-between",
    gap: 12,
  },
  header: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 0.8,
  },
  menuButton: {
    width: 32,
    height: 22,
    justifyContent: "space-between",
  },
  menuLine: {
    height: 4,
    borderRadius: 4,
    backgroundColor: "#f8fafc",
  },
  campaignHeader: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 6,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
  },
  campaignTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  campaignRoundCount: {
    color: "#38bdf8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scoreWrapper: {
    alignSelf: "stretch",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1120",
  },
  mapSection: {
    gap: 10,
  },
  prompt: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
    textAlign: "center",
  },
  optionsSection: {
    marginTop: 4,
  },
  message: {
    fontSize: 18,
    color: "#e2e8f0",
  },
  campaignSummary: {
    backgroundColor: "#111c33",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
  },
  summarySubtitle: {
    color: "#cbd5f5",
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryBlock: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 6,
  },
  summaryGoals: {
    gap: 10,
  },
  summaryGoal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryGoalStatus: {
    fontSize: 16,
  },
  summaryGoalText: {
    color: "#e2e8f0",
    fontSize: 14,
    flex: 1,
  },
  summaryButtons: {
    flexDirection: "row",
    gap: 12,
  },
  summaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  summaryPrimary: {
    backgroundColor: "#2563eb",
  },
  summarySecondary: {
    backgroundColor: "#1e293b",
  },
  summaryButtonText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  goalCompleted: {
    color: "#4ade80",
  },
  goalPending: {
    color: "#64748b",
  },
});
