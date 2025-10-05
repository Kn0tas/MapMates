import { CampaignStage } from "../data/campaign";
import { RoundHistoryEntry } from "../types/country";
import { CampaignResultSummary } from "../context/campaignStore";

export const calculateCampaignResult = (
  stage: CampaignStage,
  history: RoundHistoryEntry[]
): CampaignResultSummary => {
  const total = history.length;
  const correct = history.filter((entry) => entry.result === "correct").length;

  let runningStreak = 0;
  let bestStreak = 0;

  history.forEach((entry) => {
    if (entry.result === "correct") {
      runningStreak += 1;
      bestStreak = Math.max(bestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  });

  const accuracy = total === 0 ? 0 : correct / total;

  const goalResults = stage.goals.reduce<Record<string, boolean>>((acc, goal) => {
    switch (goal.type) {
      case "correct":
        acc[goal.id] = correct >= goal.target;
        break;
      case "accuracy":
        acc[goal.id] = accuracy >= goal.target;
        break;
      case "streak":
        acc[goal.id] = bestStreak >= goal.target;
        break;
      default:
        acc[goal.id] = false;
        break;
    }
    return acc;
  }, {});

  const completed = Object.values(goalResults).every(Boolean);

  return {
    stageId: stage.id,
    correct,
    total,
    accuracy,
    bestStreak,
    goalResults,
    completed,
  };
};

export const formatAccuracy = (value: number): string => {
  const percentage = Math.round(value * 100);
  return `${percentage}%`;
};


