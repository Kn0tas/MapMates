import { countries } from "./countries";
import { CountryGeometry } from "../types/country";

export type CampaignGoalType = "correct" | "accuracy" | "streak";

export type CampaignGoal = {
  id: string;
  type: CampaignGoalType;
  target: number;
  label: string;
};

export type CampaignStage = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mentorLine: string;
  continent: "Europe" | "Americas" | "Africa" | "Asia" | "Global";
  difficulty: "intro" | "standard" | "advanced" | "expert";
  roundLimit: number;
  countryCodes: string[];
  goals: CampaignGoal[];
  requires?: string[];
  reward: string;
  focusSkills: string[];
};

const byCode = new Map<string, CountryGeometry>(
  countries.map((country) => [country.code, country])
);

export const resolveCountryPool = (codes: string[]): CountryGeometry[] =>
  codes
    .map((code) => byCode.get(code))
    .filter((country): country is CountryGeometry => Boolean(country));

export const campaignStages: CampaignStage[] = [
  {
    id: "europe_foundations",
    title: "European Explorer",
    subtitle: "Find your bearings",
    description:
      "Build confidence with the cultural capitals of Western Europe. Small clusters and generous hints help players internalize core map shapes.",
    mentorLine: "Let's chart a relaxed path through Europe before the real adventure begins.",
    continent: "Europe",
    difficulty: "intro",
    roundLimit: 6,
    countryCodes: ["IRL", "GBR", "FRA", "ESP", "PRT", "DEU", "ITA", "NLD"],
    goals: [
      {
        id: "europe_foundations_correct",
        type: "correct",
        target: 5,
        label: "Score 5 correct answers",
      },
      {
        id: "europe_foundations_accuracy",
        type: "accuracy",
        target: 0.75,
        label: "Finish with 75% accuracy",
      },
    ],
    reward: "Unlocks Northern Frontiers and Mediterranean Discoveries",
    focusSkills: ["Shape recognition", "Capitals primer"],
  },
  {
    id: "europe_north",
    title: "Northern Frontiers",
    subtitle: "Cold climate confidence",
    description:
      "Swing through Scandinavia and the Baltics where silhouettes are trickier and coastlines jagged.",
    mentorLine: "The north winds test your eye for detail. Flow with the fjords!",
    continent: "Europe",
    difficulty: "standard",
    roundLimit: 7,
    countryCodes: ["ISL", "NOR", "SWE", "FIN", "DNK", "EST", "LVA", "LTU"],
    goals: [
      {
        id: "europe_north_correct",
        type: "correct",
        target: 5,
        label: "Log 5 correct answers",
      },
      {
        id: "europe_north_streak",
        type: "streak",
        target: 3,
        label: "Hit a 3-answer streak",
      },
    ],
    requires: ["europe_foundations"],
    reward: "Opens the Transatlantic Voyage",
    focusSkills: ["Coastlines", "Spatial spacing"],
  },
  {
    id: "europe_mediterranean",
    title: "Mediterranean Discoveries",
    subtitle: "Sun-soaked precision",
    description:
      "Tackle peninsulas and islands where orientation matters: from Iberia to the Aegean seas.",
    mentorLine: "Heat, history, and harbors—keep your compass sharp!",
    continent: "Europe",
    difficulty: "standard",
    roundLimit: 7,
    countryCodes: ["PRT", "ESP", "ITA", "GRC", "HRV", "TUR", "CYP", "MLT"],
    goals: [
      {
        id: "europe_mediterranean_correct",
        type: "correct",
        target: 6,
        label: "Nail 6 countries",
      },
      {
        id: "europe_mediterranean_accuracy",
        type: "accuracy",
        target: 0.8,
        label: "Maintain 80% accuracy",
      },
    ],
    requires: ["europe_foundations"],
    reward: "Unlocks the Transatlantic Voyage",
    focusSkills: ["Orientation", "Islands"],
  },
  {
    id: "americas_gateway",
    title: "Transatlantic Voyage",
    subtitle: "New world horizons",
    description:
      "Graduate to the Americas with a blend of landmass giants and equatorial neighbors.",
    mentorLine: "Time to cross the ocean. The currents favor the prepared!",
    continent: "Americas",
    difficulty: "standard",
    roundLimit: 8,
    countryCodes: ["CAN", "USA", "MEX", "CUB", "BRA", "ARG", "PER", "COL"],
    goals: [
      {
        id: "americas_gateway_correct",
        type: "correct",
        target: 6,
        label: "Identify 6 countries",
      },
      {
        id: "americas_gateway_accuracy",
        type: "accuracy",
        target: 0.75,
        label: "Stay above 75% accuracy",
      },
    ],
    requires: ["europe_north", "europe_mediterranean"],
    reward: "Opens African Stewardship",
    focusSkills: ["Continent shift", "Scale awareness"],
  },
  {
    id: "africa_stewards",
    title: "Savanna Survey",
    subtitle: "Continental connectors",
    description:
      "Navigate the sweeping range of African geography, from Maghreb coasts to southern plateaus.",
    mentorLine: "Africa rewards pattern hunters. Follow the rivers and ridges!",
    continent: "Africa",
    difficulty: "advanced",
    roundLimit: 8,
    countryCodes: ["MAR", "DZA", "MLI", "NGA", "GHA", "KEN", "ETH", "ZAF"],
    goals: [
      {
        id: "africa_stewards_correct",
        type: "correct",
        target: 6,
        label: "Secure 6 successes",
      },
      {
        id: "africa_stewards_streak",
        type: "streak",
        target: 4,
        label: "Earn a 4-answer streak",
      },
    ],
    requires: ["americas_gateway"],
    reward: "Unlocks the Asia Pulse",
    focusSkills: ["Regional anchors", "Equator cues"],
  },
  {
    id: "asia_pulse",
    title: "Asia Pulse",
    subtitle: "Tempo and terrain",
    description:
      "Face the fast tempo of Asia-Pacific giants and archipelagos with limited hints.",
    mentorLine: "Momentum matters—breathe through the bustle of Asia!",
    continent: "Asia",
    difficulty: "advanced",
    roundLimit: 9,
    countryCodes: [
      "SAU",
      "IRN",
      "IND",
      "PAK",
      "CHN",
      "MNG",
      "JPN",
      "KOR",
      "IDN",
      "THA",
      "VNM",
      "PHL",
    ],
    goals: [
      {
        id: "asia_pulse_correct",
        type: "correct",
        target: 7,
        label: "Get 7 right",
      },
      {
        id: "asia_pulse_accuracy",
        type: "accuracy",
        target: 0.8,
        label: "Hold 80% accuracy",
      },
      {
        id: "asia_pulse_streak",
        type: "streak",
        target: 4,
        label: "Sustain a 4-answer streak",
      },
    ],
    requires: ["africa_stewards"],
    reward: "Final challenge unlocked",
    focusSkills: ["Speed", "Island chains"],
  },
  {
    id: "global_mastery",
    title: "World Mastery",
    subtitle: "Grand finale",
    description:
      "Blend everything you've learned across continents in a demanding world tour.",
    mentorLine: "This is it. Every shore, every skyline—show the world what you've mapped!",
    continent: "Global",
    difficulty: "expert",
    roundLimit: 10,
    countryCodes: [
      "AUS",
      "NZL",
      "EGY",
      "FRA",
      "BRA",
      "IND",
      "USA",
      "JPN",
      "ZAF",
      "CAN",
      "ARG",
      "SWE",
    ],
    goals: [
      {
        id: "global_mastery_correct",
        type: "correct",
        target: 9,
        label: "Achieve 9 correct",
      },
      {
        id: "global_mastery_accuracy",
        type: "accuracy",
        target: 0.85,
        label: "Finish above 85% accuracy",
      },
      {
        id: "global_mastery_streak",
        type: "streak",
        target: 5,
        label: "Secure a 5-answer streak",
      },
    ],
    requires: ["asia_pulse"],
    reward: "Earn the Cartographer rank badge",
    focusSkills: ["Global recall", "Advanced retention"],
  },
];

export const campaignStageMap = new Map<string, CampaignStage>(
  campaignStages.map((stage) => [stage.id, stage])
);

export const getCampaignStage = (id: string): CampaignStage | undefined =>
  campaignStageMap.get(id);
