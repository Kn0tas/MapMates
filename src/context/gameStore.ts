import { create } from "zustand";

import { buildRound } from "../utils/game";
import {
  CountryGeometry,
  GameMode,
  GuessResult,
  RoundHistoryEntry,
  RoundStatus,
} from "../types/country";

type GameState = {
  mode: GameMode;
  round: number;
  score: number;
  streak: number;
  status: RoundStatus;
  target?: CountryGeometry;
  options: CountryGeometry[];
  startedAt?: number;
  revealedAt?: number;
  history: RoundHistoryEntry[];
  initGame: (mode?: GameMode) => void;
  submitGuess: (countryCode: string) => GuessResult | undefined;
  reveal: () => void;
  nextRound: () => void;
  skipRound: () => void;
};

const BASE_POINTS = 100;

const calculateElapsed = (startedAt?: number): number => {
  if (!startedAt) {
    return 0;
  }
  return Date.now() - startedAt;
};

export const useGameStore = create<GameState>((set, get) => ({
  mode: "standard",
  round: 0,
  score: 0,
  streak: 0,
  status: "idle",
  target: undefined,
  options: [],
  startedAt: undefined,
  revealedAt: undefined,
  history: [],
  initGame: (mode = "standard") => {
    const { target, options } = buildRound();

    set({
      mode,
      round: 1,
      score: 0,
      streak: 0,
      status: "playing",
      target,
      options,
      startedAt: Date.now(),
      revealedAt: undefined,
      history: [],
    });
  },
  submitGuess: (countryCode) => {
    const { target, status } = get();

    if (!target || status !== "playing") {
      return undefined;
    }

    const elapsedMs = calculateElapsed(get().startedAt);
    const isCorrect = target.code === countryCode;
    const result: GuessResult = isCorrect ? "correct" : "incorrect";

    set((state) => {
      const updatedStreak = isCorrect ? state.streak + 1 : 0;
      const pointsAwarded = isCorrect
        ? BASE_POINTS + Math.min(updatedStreak, 5) * 10
        : 0;
      const updatedScore = state.score + pointsAwarded;
      const historyEntry: RoundHistoryEntry = {
        countryCode: target.code,
        guess: countryCode,
        result,
        elapsedMs,
      };

      return {
        score: updatedScore,
        streak: updatedStreak,
        status: "revealed" as RoundStatus,
        revealedAt: Date.now(),
        history: [...state.history, historyEntry],
      };
    });

    return result;
  },
  reveal: () => {
    if (get().status !== "playing") {
      return;
    }

    set({
      status: "revealed",
      revealedAt: Date.now(),
    });
  },
  nextRound: () => {
    const { target } = get();
    const { target: nextTarget, options } = buildRound(target?.code);

    set((state) => ({
      round: state.round + 1,
      status: "playing" as RoundStatus,
      target: nextTarget,
      options,
      startedAt: Date.now(),
      revealedAt: undefined,
    }));
  },
  skipRound: () => {
    const { target, status } = get();
    if (!target || status !== "playing") {
      return;
    }

    const elapsedMs = calculateElapsed(get().startedAt);

    set((state) => ({
      history: [
        ...state.history,
        {
          countryCode: target.code,
          result: "skipped",
          elapsedMs,
        },
      ],
      status: "revealed" as RoundStatus,
      revealedAt: Date.now(),
      streak: 0,
    }));
  },
}));