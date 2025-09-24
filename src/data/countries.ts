import { ImageSourcePropType } from "react-native";

import { CountryGeometry } from "../types/country";

type CountrySeed = Omit<CountryGeometry, "asset"> & {
  asset: ImageSourcePropType;
};

const seeds: CountrySeed[] = [
  {
    code: "ITA",
    name: "Italy",
    region: "Europe",
    neighbors: [],
    asset: require("../../assets/countries/Italy.png") as ImageSourcePropType,
  },
  {
    code: "SWE",
    name: "Sweden",
    region: "Europe",
    neighbors: [],
    asset: require("../../assets/countries/Sweden.png") as ImageSourcePropType,
  },
  {
    code: "USA",
    name: "United States",
    region: "Americas",
    neighbors: [],
    asset: require("../../assets/countries/USA.png") as ImageSourcePropType,
  },
];

export const countries: CountryGeometry[] = seeds;

export const countryByCode = countries.reduce<Record<string, CountryGeometry>>(
  (acc, country) => {
    acc[country.code] = country;
    return acc;
  },
  {}
);

export const countryCodes = countries.map((country) => country.code);