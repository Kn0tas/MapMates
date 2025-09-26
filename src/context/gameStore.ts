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

type RegionFilter = "all" | "europe" | "americas" | "asiaOceania" | "africa";

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
  regionFilter: RegionFilter;
  initGame: (mode?: GameMode) => void;
  submitGuess: (countryCode: string) => GuessResult | undefined;
  reveal: () => void;
  nextRound: () => void;
  skipRound: () => void;
  setRegionFilter: (filter: RegionFilter) => void;
};

const BASE_POINTS = 100;

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
  streak: 0,
  status: "idle",
  target: undefined,
  options: [],
  startedAt: undefined,
  revealedAt: undefined,
  history: [],
  regionFilter: "all",
  initGame: (mode = "standard") => {
    const pool = getPool(get().regionFilter);
    const { target, options } = buildRound(pool);

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
    const pool = getPool(get().regionFilter);
    const { target: nextTarget, options } = buildRound(pool, target?.code);

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
  setRegionFilter: (filter) => {
    const pool = getPool(filter);
    const { target, options } = buildRound(pool);

    set({
      regionFilter: filter,
      mode: "standard",
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
}));
export type { RegionFilter };

