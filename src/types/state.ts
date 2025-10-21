import { ImageSourcePropType } from "react-native";

import { GuessResult } from "./country";

export type StateRegion = "Northeast" | "Midwest" | "South" | "West";

export type StateGeometry = {
  code: string;
  name: string;
  region: StateRegion;
  neighbors: string[];
  asset: ImageSourcePropType;
};

export type StateRoundHistoryEntry = {
  stateCode: string;
  guess?: string;
  result: GuessResult;
  elapsedMs: number;
};
