export type CountryRegion =
  | "Africa"
  | "Americas"
  | "Asia"
  | "Europe"
  | "Oceania";

export type CountryGeometry = {
  code: string;
  name: string;
  region: CountryRegion;
  capital: string;
  neighbors: string[];
  svg: {
    viewBox: string;
    shapes: Array<{
      code: string;
      path: string;
    }>;
  };
};

export type GameMode = "standard" | "timed";

export type RoundStatus = "idle" | "playing" | "revealed" | "complete";

export type GuessResult = "correct" | "incorrect" | "skipped";

export type RoundHistoryEntry = {
  countryCode: string;
  guess?: string;
  result: GuessResult;
  elapsedMs: number;
};