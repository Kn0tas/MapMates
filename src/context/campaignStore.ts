import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

import { CampaignStage } from "../data/campaign";

export type CampaignResultSummary = {
  stageId: string;
  correct: number;
  total: number;
  accuracy: number;
  bestStreak: number;
  goalResults: Record<string, boolean>;
  completed: boolean;
};

type StageProgress = {
  attempts: number;
  bestCorrect: number;
  bestAccuracy: number;
  bestStreak: number;
  completedGoalIds: string[];
  completed: boolean;
  completedAt?: number;
  lastPlayedAt?: number;
  lastResult?: CampaignResultSummary;
};

type CampaignState = {
  stageProgress: Record<string, StageProgress>;
  markAttempt: (summary: CampaignResultSummary) => void;
  resetCampaign: () => void;
};

type CampaignStageStatus = "locked" | "available" | "completed";

const storage = createJSONStorage(() => ({
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
}));

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      stageProgress: {},
      markAttempt: (summary) => {
        set((state) => {
          const previous = state.stageProgress[summary.stageId];
          const newCompletedGoals = Object.entries(summary.goalResults)
            .filter(([, achieved]) => achieved)
            .map(([goalId]) => goalId);
          const mergedGoalIds = Array.from(
            new Set([...(previous?.completedGoalIds ?? []), ...newCompletedGoals])
          );
          const isCompleted = summary.completed || mergedGoalIds.length === newCompletedGoals.length;

          return {
            stageProgress: {
              ...state.stageProgress,
              [summary.stageId]: {
                attempts: (previous?.attempts ?? 0) + 1,
                bestCorrect: Math.max(previous?.bestCorrect ?? 0, summary.correct),
                bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, summary.accuracy),
                bestStreak: Math.max(previous?.bestStreak ?? 0, summary.bestStreak),
                completedGoalIds: mergedGoalIds,
                completed: previous?.completed ? true : summary.completed,
                completedAt: previous?.completed
                  ? previous.completedAt
                  : summary.completed
                  ? Date.now()
                  : undefined,
                lastPlayedAt: Date.now(),
                lastResult: summary,
              },
            },
          };
        });
      },
      resetCampaign: () => set({ stageProgress: {} }),
    }),
    {
      name: "mapmates-campaign",
      storage,
      version: 1,
      partialize: (state) => ({ stageProgress: state.stageProgress }),
    }
  )
);

export const getStageStatus = (
  stage: CampaignStage,
  progress: Record<string, StageProgress>
): CampaignStageStatus => {
  const stageRecord = progress[stage.id];
  if (stageRecord?.completed) {
    return "completed";
  }

  const prerequisites = stage.requires ?? [];
  const allPrereqsMet = prerequisites.every(
    (requirementId) => progress[requirementId]?.completed
  );

  if (!allPrereqsMet) {
    return "locked";
  }

  return "available";
};

export type { StageProgress, CampaignStageStatus };
