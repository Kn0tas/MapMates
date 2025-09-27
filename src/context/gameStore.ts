import { create } from "zustand";

import { buildRound } from "../utils/game";
import {
  CountryGeometry,
  GameMode,
  GuessResult,
  RoundHistoryEntry,
  RoundStatus,
  CountryRegion,
} from "../types/country";
import { countries } from "../data/countries";

export const ROUND_LIMIT = 20;
const CORRECT_POINTS = 10;
const FAIL_STREAK_LIMIT = 4;
type RegionFilter = "all" | "europe" | "americas" | "asiaOceania" | "africa";

type GameState = {
  mode: GameMode;
  round: number;
  score: number;
  highScore: number;
  streak: number;
  incorrectStreak: number;
  status: RoundStatus;
  target?: CountryGeometry;
  options: CountryGeometry[];
  startedAt?: number;
  revealedAt?: number;
  history: RoundHistoryEntry[];
  regionFilter: RegionFilter;
  autoAdvanceReason?: "fail-streak";
  initGame: (mode?: GameMode) => void;
  submitGuess: (countryCode: string) => GuessResult | undefined;
  reveal: () => void;
  nextRound: () => void;
  skipRound: () => void;
  setRegionFilter: (filter: RegionFilter) => void;
  acknowledgeAutoAdvance: () => void;
};

const calculateElapsed = (startedAt?: number): number => {
  if (!startedAt) {
    return 0;
  }
  return Date.now() - startedAt;
};

const REGION_MAP: Record<Exclude<RegionFilter, "all">, CountryRegion[]> = {
  europe: ["Europe"],
  americas: ["Americas"],
  asiaOceania: ["Asia", "Oceania"],
  africa: ["Africa"],
};

const filterCountries = (filter: RegionFilter): CountryGeometry[] => {
  if (filter === "all") {
    return countries;
  }
  const allowed = REGION_MAP[filter];
  return countries.filter((country) => allowed.includes(country.region));
};

const getPool = (filter: RegionFilter): CountryGeometry[] => {
  const pool = filterCountries(filter);
  return pool.length ? pool : countries;
};

export const useGameStore = create<GameState>((set, get) => ({
  mode: "standard",
  round: 0,
  score: 0,
  highScore: 0,
  streak: 0,
  incorrectStreak: 0,
  status: "idle",
  target: undefined,
  options: [],
  startedAt: undefined,
  revealedAt: undefined,
  history: [],
  regionFilter: "all",
  autoAdvanceReason: undefined,
  initGame: (mode = "standard") => {
    const pool = getPool(get().regionFilter);
    const { target, options } = buildRound(pool);

    set({
      mode,
      round: 1,
      score: 0,
      streak: 0,
      incorrectStreak: 0,
      status: "playing",
      target,
      options,
      startedAt: Date.now(),
      revealedAt: undefined,
      history: [],
      autoAdvanceReason: undefined,
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
    let shouldAutoAdvance = false;

    set((state) => {
      const incorrectStreak = isCorrect ? 0 : state.incorrectStreak + 1;
      const shouldTriggerAutoAdvance = !isCorrect && incorrectStreak >= FAIL_STREAK_LIMIT;

      if (shouldTriggerAutoAdvance) {
        shouldAutoAdvance = true;
      }

      const updatedScore = state.score + (isCorrect ? CORRECT_POINTS : 0);
      const updatedStreak = isCorrect ? state.streak + 1 : 0;
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
        incorrectStreak,
        autoAdvanceReason: shouldTriggerAutoAdvance ? "fail-streak" : undefined,
      };
    });

    if (shouldAutoAdvance) {
      setTimeout(() => {
        const { status: latestStatus, autoAdvanceReason } = get();
        if (latestStatus !== "revealed" || autoAdvanceReason !== "fail-streak") {
          return;
        }

        get().nextRound();
        set({ autoAdvanceReason: undefined });
      }, 1500);
    }

    return result;
  },
  reveal: () => {
    if (get().status !== "playing") {
      return;
    }

    set({
      status: "revealed",
      revealedAt: Date.now(),
      autoAdvanceReason: undefined,
    });
  },
  nextRound: () => {
    const state = get();

    if (state.round >= ROUND_LIMIT) {
      set((current) => ({
        status: "complete" as RoundStatus,
        revealedAt: Date.now(),
        highScore: Math.max(current.highScore, current.score),
        autoAdvanceReason: undefined,
      }));
      return;
    }

    const pool = getPool(state.regionFilter);
    const { target: nextTarget, options } = buildRound(pool, state.target?.code);

    set((s) => ({
      round: s.round + 1,
      status: "playing" as RoundStatus,
      target: nextTarget,
      options,
      startedAt: Date.now(),
      revealedAt: undefined,
      autoAdvanceReason: undefined,
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
      autoAdvanceReason: undefined,
    }));
  },
  setRegionFilter: (filter) => {
    const pool = getPool(filter);
    const { target, options } = buildRound(pool);

    set((state) => ({
      regionFilter: filter,
      mode: "standard",
      round: 1,
      score: 0,
      streak: 0,
      incorrectStreak: 0,
      status: "playing",
      target,
      options,
      startedAt: Date.now(),
      revealedAt: undefined,
      history: [],
      highScore: state.highScore,
      autoAdvanceReason: undefined,
    }));
  },
  acknowledgeAutoAdvance: () => {
    set({ autoAdvanceReason: undefined });
  },
}));

export type { RegionFilter };
