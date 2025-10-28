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

type RegionFilter = "all" | "europe" | "americas" | "asiaOceania" | "africa";
type InitOptions = {
  mode?: GameMode;
  pool?: CountryGeometry[];
  roundLimit?: number;
  campaignStageId?: string;
};

type GameState = {
  mode: GameMode;
  campaignStageId?: string;
  round: number;
  score: number;
  highScore: number;
  streak: number;
  status: RoundStatus;
  target?: CountryGeometry;
  options: CountryGeometry[];
  startedAt?: number;
  revealedAt?: number;
  history: RoundHistoryEntry[];
  regionFilter: RegionFilter;
  roundLimit: number;
  activePool?: CountryGeometry[];
  usedTargetCodes: string[];
  initGame: (options?: InitOptions) => void;
  submitGuess: (countryCode: string) => GuessResult | undefined;
  reveal: () => void;
  nextRound: () => void;
  skipRound: () => void;
  setRegionFilter: (filter: RegionFilter) => void;
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
  campaignStageId: undefined,
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
  regionFilter: "all",
  roundLimit: ROUND_LIMIT,
  activePool: undefined,
  usedTargetCodes: [],
  initGame: (options) => {
    const {
      mode = "standard",
      pool,
      roundLimit = ROUND_LIMIT,
      campaignStageId,
    } = options ?? {};

    const resolvedPool = pool ?? getPool(get().regionFilter);
    const { target, options: roundOptions } = buildRound(resolvedPool, undefined, []);

    set({
      mode,
      campaignStageId,
      round: 1,
      score: 0,
      streak: 0,
      status: "playing",
      target,
      options: roundOptions,
      startedAt: Date.now(),
      revealedAt: undefined,
      history: [],
      usedTargetCodes: [target.code],
      activePool: pool,
      roundLimit,
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

    const pool = state.activePool ?? getPool(state.regionFilter);
    const usedCodes = state.usedTargetCodes;
    const uniquePoolLength = pool.length;
    const shouldReset = usedCodes.length >= uniquePoolLength && uniquePoolLength > 0;
    const effectiveExclude = shouldReset ? [] : usedCodes;
    const { target: nextTarget, options } = buildRound(pool, state.target?.code, effectiveExclude);
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
  setRegionFilter: (filter) => {
    const pool = getPool(filter);
    const { target, options } = buildRound(pool, undefined, []);

    set((state) => ({
      regionFilter: filter,
      mode: "standard",
      campaignStageId: undefined,
      round: 1,
      score: 0,
      streak: 0,
      status: "playing",
      target,
      options,
      startedAt: Date.now(),
      revealedAt: undefined,
      history: [],
      usedTargetCodes: [target.code],
      highScore: state.highScore,
      activePool: undefined,
      roundLimit: ROUND_LIMIT,
    }));
  },
}));

export type { RegionFilter, InitOptions };
