import { ImageSourcePropType } from "react-native";

export type CountryRegion =
  | "Africa"
  | "Americas"
  | "Asia"
  | "Europe"
  | "Oceania"
  | "Other";

export type CountryGeometry = {
  code: string;
  name: string;
  region: CountryRegion;
  neighbors: string[];
  asset: ImageSourcePropType;
};

export type GameMode = "standard" | "timed" | "campaign";

export type RoundStatus = "idle" | "playing" | "revealed" | "complete";

export type GuessResult = "correct" | "incorrect" | "skipped";

export type RoundHistoryEntry = {
  countryCode: string;
  guess?: string;
  result: GuessResult;
  elapsedMs: number;
};
