import { ImageSourcePropType } from "react-native";

import { CountryGeometry } from "../types/country";

export const countries: CountryGeometry[] = [
  {
    code: "BGD",
    name: "Bangladesh",
    region: "Asia",
    neighbors: ["IND"],
    asset: require("../../assets/countries/bangladesh.png") as ImageSourcePropType,
  },
  {
    code: "BRA",
    name: "Brazil",
    region: "Americas",
    neighbors: [],
    asset: require("../../assets/countries/brazil.png") as ImageSourcePropType,
  },
  {
    code: "CHN",
    name: "China",
    region: "Asia",
    neighbors: ["IND", "RUS", "VNM"],
    asset: require("../../assets/countries/China.png") as ImageSourcePropType,
  },
  {
    code: "COD",
    name: "Democratic Republic of the Congo",
    region: "Africa",
    neighbors: [],
    asset: require("../../assets/countries/Democratic Republic of the Congo.png") as ImageSourcePropType,
  },
  {
    code: "EGY",
    name: "Egypt",
    region: "Africa",
    neighbors: [],
    asset: require("../../assets/countries/egypt.png") as ImageSourcePropType,
  },
  {
    code: "ETH",
    name: "Ethiopia",
    region: "Africa",
    neighbors: [],
    asset: require("../../assets/countries/Ethiopia.png") as ImageSourcePropType,
  },
  {
    code: "FRA",
    name: "France",
    region: "Europe",
    neighbors: ["DEU", "ITA", "GBR"],
    asset: require("../../assets/countries/France.png") as ImageSourcePropType,
  },
  {
    code: "DEU",
    name: "Germany",
    region: "Europe",
    neighbors: ["FRA"],
    asset: require("../../assets/countries/Germany.png") as ImageSourcePropType,
  },
  {
    code: "IND",
    name: "India",
    region: "Asia",
    neighbors: ["BGD", "CHN", "PAK"],
    asset: require("../../assets/countries/India.png") as ImageSourcePropType,
  },
  {
    code: "IDN",
    name: "Indonesia",
    region: "Asia",
    neighbors: ["PHL", "VNM"],
    asset: require("../../assets/countries/Indonesia.png") as ImageSourcePropType,
  },
  {
    code: "IRN",
    name: "Iran",
    region: "Asia",
    neighbors: ["PAK", "TUR"],
    asset: require("../../assets/countries/iran.png") as ImageSourcePropType,
  },
  {
    code: "ITA",
    name: "Italy",
    region: "Europe",
    neighbors: ["FRA"],
    asset: require("../../assets/countries/Italy.png") as ImageSourcePropType,
  },
  {
    code: "JPN",
    name: "Japan",
    region: "Asia",
    neighbors: ["CHN", "RUS"],
    asset: require("../../assets/countries/japan.png") as ImageSourcePropType,
  },
  {
    code: "MEX",
    name: "Mexico",
    region: "Americas",
    neighbors: ["USA"],
    asset: require("../../assets/countries/mexico.png") as ImageSourcePropType,
  },
  {
    code: "NGA",
    name: "Nigeria",
    region: "Africa",
    neighbors: [],
    asset: require("../../assets/countries/Nigeria.png") as ImageSourcePropType,
  },
  {
    code: "PAK",
    name: "Pakistan",
    region: "Asia",
    neighbors: ["IND", "CHN", "IRN"],
    asset: require("../../assets/countries/pakistan.png") as ImageSourcePropType,
  },
  {
    code: "PHL",
    name: "Philippines",
    region: "Asia",
    neighbors: ["IDN", "VNM"],
    asset: require("../../assets/countries/Philippines.png") as ImageSourcePropType,
  },
  {
    code: "RUS",
    name: "Russia",
    region: "Europe",
    neighbors: ["CHN", "USA", "JPN"],
    asset: require("../../assets/countries/Russia.png") as ImageSourcePropType,
  },
  {
    code: "SWE",
    name: "Sweden",
    region: "Europe",
    neighbors: [],
    asset: require("../../assets/countries/Sweden.png") as ImageSourcePropType,
  },
  {
    code: "TUR",
    name: "Turkey",
    region: "Asia",
    neighbors: ["IRN"],
    asset: require("../../assets/countries/turkey.png") as ImageSourcePropType,
  },
  {
    code: "GBR",
    name: "United Kingdom",
    region: "Europe",
    neighbors: ["FRA"],
    asset: require("../../assets/countries/United Kingdom.png") as ImageSourcePropType,
  },
  {
    code: "USA",
    name: "United States",
    region: "Americas",
    neighbors: ["MEX", "RUS"],
    asset: require("../../assets/countries/USA.png") as ImageSourcePropType,
  },
  {
    code: "VNM",
    name: "Vietnam",
    region: "Asia",
    neighbors: ["CHN", "IDN", "PHL"],
    asset: require("../../assets/countries/vietnam.png") as ImageSourcePropType,
  },
];

export const countryByCode = countries.reduce<Record<string, CountryGeometry>>(
  (acc, country) => {
    acc[country.code] = country;
    return acc;
  },
  {}
);

export const countryCodes = countries.map((country) => country.code);