import { CountryGeometry } from "../types/country";

const sharedShapes = {
  FRA: "M90 30 L150 30 L180 80 L150 130 L100 120 L70 80 Z",
  ESP: "M30 90 L80 90 L100 140 L40 140 Z",
  PRT: "M15 90 L30 90 L40 140 L20 140 Z",
  DEU: "M130 10 L170 10 L190 60 L160 110 L120 90 Z",
  BEL: "M120 30 L140 30 L150 50 L130 60 Z",
  NLD: "M120 20 L140 20 L145 30 L125 30 Z",
  CHE: "M130 70 L160 70 L160 90 L130 90 Z",
  ITA: "M170 80 L190 90 L180 140 L150 130 Z",
  AUT: "M150 100 L190 100 L190 120 L150 120 Z"
} as const;

const baseViewBox = "0 0 220 160";

export const countries: CountryGeometry[] = [
  {
    code: "FRA",
    name: "France",
    region: "Europe",
    capital: "Paris",
    neighbors: ["ESP", "DEU", "BEL", "CHE", "ITA"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "FRA", path: sharedShapes.FRA },
        { code: "ESP", path: sharedShapes.ESP },
        { code: "DEU", path: sharedShapes.DEU },
        { code: "BEL", path: sharedShapes.BEL },
        { code: "CHE", path: sharedShapes.CHE },
        { code: "ITA", path: sharedShapes.ITA }
      ]
    }
  },
  {
    code: "ESP",
    name: "Spain",
    region: "Europe",
    capital: "Madrid",
    neighbors: ["FRA", "PRT"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "ESP", path: sharedShapes.ESP },
        { code: "FRA", path: sharedShapes.FRA },
        { code: "PRT", path: sharedShapes.PRT }
      ]
    }
  },
  {
    code: "PRT",
    name: "Portugal",
    region: "Europe",
    capital: "Lisbon",
    neighbors: ["ESP"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "PRT", path: sharedShapes.PRT },
        { code: "ESP", path: sharedShapes.ESP }
      ]
    }
  },
  {
    code: "DEU",
    name: "Germany",
    region: "Europe",
    capital: "Berlin",
    neighbors: ["FRA", "BEL", "NLD", "CHE", "AUT"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "DEU", path: sharedShapes.DEU },
        { code: "FRA", path: sharedShapes.FRA },
        { code: "BEL", path: sharedShapes.BEL },
        { code: "NLD", path: sharedShapes.NLD },
        { code: "CHE", path: sharedShapes.CHE },
        { code: "AUT", path: sharedShapes.AUT }
      ]
    }
  },
  {
    code: "BEL",
    name: "Belgium",
    region: "Europe",
    capital: "Brussels",
    neighbors: ["FRA", "DEU", "NLD"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "BEL", path: sharedShapes.BEL },
        { code: "FRA", path: sharedShapes.FRA },
        { code: "DEU", path: sharedShapes.DEU },
        { code: "NLD", path: sharedShapes.NLD }
      ]
    }
  },
  {
    code: "NLD",
    name: "Netherlands",
    region: "Europe",
    capital: "Amsterdam",
    neighbors: ["BEL", "DEU"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "NLD", path: sharedShapes.NLD },
        { code: "BEL", path: sharedShapes.BEL },
        { code: "DEU", path: sharedShapes.DEU }
      ]
    }
  },
  {
    code: "CHE",
    name: "Switzerland",
    region: "Europe",
    capital: "Bern",
    neighbors: ["FRA", "DEU", "ITA"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "CHE", path: sharedShapes.CHE },
        { code: "FRA", path: sharedShapes.FRA },
        { code: "DEU", path: sharedShapes.DEU },
        { code: "ITA", path: sharedShapes.ITA }
      ]
    }
  },
  {
    code: "ITA",
    name: "Italy",
    region: "Europe",
    capital: "Rome",
    neighbors: ["FRA", "CHE", "AUT"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "ITA", path: sharedShapes.ITA },
        { code: "FRA", path: sharedShapes.FRA },
        { code: "CHE", path: sharedShapes.CHE },
        { code: "AUT", path: sharedShapes.AUT }
      ]
    }
  },
  {
    code: "AUT",
    name: "Austria",
    region: "Europe",
    capital: "Vienna",
    neighbors: ["DEU", "CHE", "ITA"],
    svg: {
      viewBox: baseViewBox,
      shapes: [
        { code: "AUT", path: sharedShapes.AUT },
        { code: "DEU", path: sharedShapes.DEU },
        { code: "CHE", path: sharedShapes.CHE },
        { code: "ITA", path: sharedShapes.ITA }
      ]
    }
  }
];

export const countryByCode = countries.reduce<Record<string, CountryGeometry>>(
  (acc, country) => {
    acc[country.code] = country;
    return acc;
  },
  {}
);

export const countryCodes = countries.map((country) => country.code);