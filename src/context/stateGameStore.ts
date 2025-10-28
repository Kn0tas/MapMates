import { create } from "zustand";

import { states } from "../data/states";
import { buildStateRound } from "../utils/stateGame";
import { GuessResult, RoundStatus } from "../types/country";
import { StateGeometry, StateRoundHistoryEntry } from "../types/state";

export const STATES_ROUND_LIMIT = 20;
const CORRECT_POINTS = 10;

type InitOptions = {
  pool?: StateGeometry[];
  roundLimit?: number;
};

type StatesGameState = {
  round: number;
  score: number;
  highScore: number;
  streak: number;
  status: RoundStatus;
  target?: StateGeometry;
  options: StateGeometry[];
  startedAt?: number;
  revealedAt?: number;
  history: StateRoundHistoryEntry[];
  roundLimit: number;
  activePool?: StateGeometry[];
  usedTargetCodes: string[];
  initGame: (options?: InitOptions) => void;
  submitGuess: (stateCode: string) => GuessResult | undefined;
  reveal: () => void;
  nextRound: () => void;
  skipRound: () => void;
};

const calculateElapsed = (startedAt?: number): number => {
  if (!startedAt) {
    return 0;
  }
  return Date.now() - startedAt;
};

export const useStatesGameStore = create<StatesGameState>((set, get) => ({
  round: 0,
  score: 0,
  highScore: 0,
  streak: 0,
  status: "idle",
  target: undefined,
  options: [],
  startedAt: undefined,
  revealedAt: undefined,
  history: [],
  roundLimit: STATES_ROUND_LIMIT,
  activePool: undefined,
  usedTargetCodes: [],
  initGame: (options) => {
    const { pool, roundLimit = STATES_ROUND_LIMIT } = options ?? {};
    const resolvedPool = pool ?? states;
    const { target, options: roundOptions } = buildStateRound(resolvedPool, undefined, []);

    set((state) => ({
      round: 1,
      score: 0,
      streak: 0,
      status: "playing" as RoundStatus,
      target,
      options: roundOptions,
      startedAt: Date.now(),
      revealedAt: undefined,
      history: [],
      usedTargetCodes: [target.code],
      activePool: pool,
      roundLimit,
      highScore: state.highScore,
    }));
  },
  submitGuess: (stateCode) => {
    const { target, status } = get();

    if (!target || status !== "playing") {
      return undefined;
    }

    const elapsedMs = calculateElapsed(get().startedAt);
    const isCorrect = target.code === stateCode;
    const result: GuessResult = isCorrect ? "correct" : "incorrect";

    set((state) => {
      const updatedScore = state.score + (isCorrect ? CORRECT_POINTS : 0);
      const updatedStreak = isCorrect ? state.streak + 1 : 0;
      const historyEntry: StateRoundHistoryEntry = {
        stateCode: target.code,
        guess: stateCode,
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
    const state = get();

    if (state.round >= state.roundLimit) {
      set((current) => ({
        status: "complete" as RoundStatus,
        revealedAt: Date.now(),
        highScore: Math.max(current.highScore, current.score),
      }));
      return;
    }

    const pool = state.activePool ?? states;
    const usedCodes = state.usedTargetCodes;
    const uniquePoolLength = pool.length;
    const shouldReset = usedCodes.length >= uniquePoolLength && uniquePoolLength > 0;
    const effectiveExclude = shouldReset ? [] : usedCodes;
    const { target: nextTarget, options } = buildStateRound(pool, state.target?.code, effectiveExclude);
    const updatedUsed = shouldReset ? [nextTarget.code] : [...usedCodes, nextTarget.code];

    set((s) => ({
      round: s.round + 1,
      status: "playing" as RoundStatus,
      target: nextTarget,
      options,
      startedAt: Date.now(),
      revealedAt: undefined,
      usedTargetCodes: updatedUsed,
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
          stateCode: target.code,
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

export type { StatesGameState, InitOptions as StatesInitOptions };
