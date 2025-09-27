import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "assets", "countries");
const OUTPUT = path.join(process.cwd(), "src", "data", "countries.ts");
const JSON_OUTPUT = path.join(process.cwd(), "src", "data", "countries.json");

const SKIP = new Set(["eu bulgaria svg"]);

const CODE_BY_NAME = {
  abkhazia: "ABH",
  afghanistan: "AFG",
  albania: "ALB",
  algeria: "DZA",
  andorra: "AND",
  angola: "AGO",
  "antigua and barbuda": "ATG",
  argentina: "ARG",
  armenia: "ARM",
  australia: "AUS",
  austria: "AUT",
  azerbaijan: "AZE",
  bahamas: "BHS",
  bahrain: "BHR",
  bangladesh: "BGD",
  barbados: "BRB",
  belarus: "BLR",
  belgium: "BEL",
  belize: "BLZ",
  benin: "BEN",
  bhutan: "BTN",
  bolivia: "BOL",
  "bosnia and herzegovina": "BIH",
  botswana: "BWA",
  brazil: "BRA",
  brunei: "BRN",
  bulgaria: "BGR",
  "burkina faso": "BFA",
  burundi: "BDI",
  cambodia: "KHM",
  cameroon: "CMR",
  canada: "CAN",
  "cape verde": "CPV",
  "central african republic": "CAF",
  chad: "TCD",
  chile: "CHL",
  china: "CHN",
  colombia: "COL",
  comoros: "COM",
  "costa rica": "CRI",
  croatia: "HRV",
  cuba: "CUB",
  cyprus: "CYP",
  "czech republic": "CZE",
  "democratic republic of the congo": "COD",
  denmark: "DNK",
  djibouti: "DJI",
  dominica: "DMA",
  "dominican republic": "DOM",
  ecuador: "ECU",
  egypt: "EGY",
  "equatorial guinea": "GNQ",
  eritrea: "ERI",
  estonia: "EST",
  eswatini: "SWZ",
  ethiopia: "ETH",
  "faroe islands": "FRO",
  "federated states of micronesia": "FSM",
  fiji: "FJI",
  finland: "FIN",
  france: "FRA",
  gabon: "GAB",
  gambia: "GMB",
  georgia: "GEO",
  germany: "DEU",
  ghana: "GHA",
  greece: "GRC",
  greenland: "GRL",
  grenada: "GRD",
  guatemala: "GTM",
  guinea: "GIN",
  "guinea bissau": "GNB",
  guyana: "GUY",
  haiti: "HTI",
  honduras: "HND",
  "hong kong": "HKG",
  hungary: "HUN",
  iceland: "ISL",
  india: "IND",
  indonesia: "IDN",
  iran: "IRN",
  iraq: "IRQ",
  ireland: "IRL",
  israel: "ISR",
  italy: "ITA",
  "ivory coast": "CIV",
  jamaica: "JAM",
  japan: "JPN",
  jordan: "JOR",
  kazakhstan: "KAZ",
  kenya: "KEN",
  kiribati: "KIR",
  kosovo: "XKX",
  kuwait: "KWT",
  kyrgyzstan: "KGZ",
  laos: "LAO",
  latvia: "LVA",
  lebanon: "LBN",
  lesotho: "LSO",
  liberia: "LBR",
  libya: "LBY",
  lithuania: "LTU",
  luxembourg: "LUX",
  madagascar: "MDG",
  malawi: "MWI",
  malaysia: "MYS",
  maldives: "MDV",
  mali: "MLI",
  malta: "MLT",
  mauritania: "MRT",
  mauritius: "MUS",
  mexico: "MEX",
  moldova: "MDA",
  mongolia: "MNG",
  montenegro: "MNE",
  morocco: "MAR",
  mozambique: "MOZ",
  myanmar: "MMR",
  namibia: "NAM",
  nepal: "NPL",
  netherlands: "NLD",
  "new zealand": "NZL",
  nicaragua: "NIC",
  niger: "NER",
  nigeria: "NGA",
  "north korea": "PRK",
  "north macedonia": "MKD",
  "northern cyprus": "NCY",
  norway: "NOR",
  oman: "OMN",
  pakistan: "PAK",
  palestine: "PSE",
  panama: "PAN",
  "papua new guinea": "PNG",
  paraguay: "PRY",
  peru: "PER",
  philippines: "PHL",
  poland: "POL",
  portugal: "PRT",
  qatar: "QAT",
  romania: "ROU",
  russia: "RUS",
  rwanda: "RWA",
  "saint lucia": "LCA",
  "saint vincent and the grenadines": "VCT",
  samoa: "WSM",
  "sao tome and principe": "STP",
  "saudi arabia": "SAU",
  senegal: "SEN",
  serbia: "SRB",
  seychelles: "SYC",
  "sierra leone": "SLE",
  singapore: "SGP",
  slovakia: "SVK",
  slovenia: "SVN",
  "solomon islands": "SLB",
  somalia: "SOM",
  "south africa": "ZAF",
  "south korea": "KOR",
  "south ossetia": "SOS",
  "south sudan": "SSD",
  spain: "ESP",
  "sri lanka": "LKA",
  sudan: "SDN",
  suriname: "SUR",
  sweden: "SWE",
  switzerland: "CHE",
  syria: "SYR",
  taiwan: "TWN",
  tajikistan: "TJK",
  tanzania: "TZA",
  thailand: "THA",
  "timor leste": "TLS",
  togo: "TGO",
  tonga: "TON",
  transnistria: "TRN",
  "trinidad and tobago": "TTO",
  tunisia: "TUN",
  turkey: "TUR",
  turkmenistan: "TKM",
  uganda: "UGA",
  ukraine: "UKR",
  "united arab emirates": "ARE",
  "united kingdom": "GBR",
  uruguay: "URY",
  usa: "USA",
  uzbekistan: "UZB",
  vanuatu: "VUT",
  venezuela: "VEN",
  vietnam: "VNM",
  yemen: "YEM",
  zambia: "ZMB",
  zimbabwe: "ZWE",
};

const REGION_BY_NAME = {
  abkhazia: "Asia",
  afghanistan: "Asia",
  albania: "Europe",
  algeria: "Africa",
  andorra: "Europe",
  angola: "Africa",
  "antigua and barbuda": "Americas",
  argentina: "Americas",
  armenia: "Asia",
  australia: "Oceania",
  austria: "Europe",
  azerbaijan: "Asia",
  bahamas: "Americas",
  bahrain: "Asia",
  bangladesh: "Asia",
  barbados: "Americas",
  belarus: "Europe",
  belgium: "Europe",
  belize: "Americas",
  benin: "Africa",
  bhutan: "Asia",
  bolivia: "Americas",
  "bosnia and herzegovina": "Europe",
  botswana: "Africa",
  brazil: "Americas",
  brunei: "Asia",
  bulgaria: "Europe",
  "burkina faso": "Africa",
  burundi: "Africa",
  cambodia: "Asia",
  cameroon: "Africa",
  canada: "Americas",
  "cape verde": "Africa",
  "central african republic": "Africa",
  chad: "Africa",
  chile: "Americas",
  china: "Asia",
  colombia: "Americas",
  comoros: "Africa",
  "costa rica": "Americas",
  croatia: "Europe",
  cuba: "Americas",
  cyprus: "Asia",
  "czech republic": "Europe",
  "democratic republic of the congo": "Africa",
  denmark: "Europe",
  djibouti: "Africa",
  dominica: "Americas",
  "dominican republic": "Americas",
  ecuador: "Americas",
  egypt: "Africa",
  "equatorial guinea": "Africa",
  eritrea: "Africa",
  estonia: "Europe",
  eswatini: "Africa",
  ethiopia: "Africa",
  "faroe islands": "Europe",
  "federated states of micronesia": "Oceania",
  fiji: "Oceania",
  finland: "Europe",
  france: "Europe",
  gabon: "Africa",
  gambia: "Africa",
  georgia: "Asia",
  germany: "Europe",
  ghana: "Africa",
  greece: "Europe",
  greenland: "Americas",
  grenada: "Americas",
  guatemala: "Americas",
  guinea: "Africa",
  "guinea bissau": "Africa",
  guyana: "Americas",
  haiti: "Americas",
  honduras: "Americas",
  "hong kong": "Asia",
  hungary: "Europe",
  iceland: "Europe",
  india: "Asia",
  indonesia: "Asia",
  iran: "Asia",
  iraq: "Asia",
  ireland: "Europe",
  israel: "Asia",
  italy: "Europe",
  "ivory coast": "Africa",
  jamaica: "Americas",
  japan: "Asia",
  jordan: "Asia",
  kazakhstan: "Asia",
  kenya: "Africa",
  kiribati: "Oceania",
  kosovo: "Europe",
  kuwait: "Asia",
  kyrgyzstan: "Asia",
  laos: "Asia",
  latvia: "Europe",
  lebanon: "Asia",
  lesotho: "Africa",
  liberia: "Africa",
  libya: "Africa",
  lithuania: "Europe",
  luxembourg: "Europe",
  madagascar: "Africa",
  malawi: "Africa",
  malaysia: "Asia",
  maldives: "Asia",
  mali: "Africa",
  malta: "Europe",
  mauritania: "Africa",
  mauritius: "Africa",
  mexico: "Americas",
  moldova: "Europe",
  mongolia: "Asia",
  montenegro: "Europe",
  morocco: "Africa",
  mozambique: "Africa",
  myanmar: "Asia",
  namibia: "Africa",
  nepal: "Asia",
  netherlands: "Europe",
  "new zealand": "Oceania",
  nicaragua: "Americas",
  niger: "Africa",
  nigeria: "Africa",
  "north korea": "Asia",
  "north macedonia": "Europe",
  "northern cyprus": "Asia",
  norway: "Europe",
  oman: "Asia",
  pakistan: "Asia",
  palestine: "Asia",
  panama: "Americas",
  "papua new guinea": "Oceania",
  paraguay: "Americas",
  peru: "Americas",
  philippines: "Asia",
  poland: "Europe",
  portugal: "Europe",
  qatar: "Asia",
  romania: "Europe",
  russia: "Europe",
  rwanda: "Africa",
  "saint lucia": "Americas",
  "saint vincent and the grenadines": "Americas",
  samoa: "Oceania",
  "sao tome and principe": "Africa",
  "saudi arabia": "Asia",
  senegal: "Africa",
  serbia: "Europe",
  seychelles: "Africa",
  "sierra leone": "Africa",
  singapore: "Asia",
  slovakia: "Europe",
  slovenia: "Europe",
  "solomon islands": "Oceania",
  somalia: "Africa",
  "south africa": "Africa",
  "south korea": "Asia",
  "south ossetia": "Asia",
  "south sudan": "Africa",
  spain: "Europe",
  "sri lanka": "Asia",
  sudan: "Africa",
  suriname: "Americas",
  sweden: "Europe",
  switzerland: "Europe",
  syria: "Asia",
  taiwan: "Asia",
  tajikistan: "Asia",
  tanzania: "Africa",
  thailand: "Asia",
  "timor leste": "Asia",
  togo: "Africa",
  tonga: "Oceania",
  transnistria: "Europe",
  "trinidad and tobago": "Americas",
  tunisia: "Africa",
  turkey: "Asia",
  turkmenistan: "Asia",
  uganda: "Africa",
  ukraine: "Europe",
  "united arab emirates": "Asia",
  "united kingdom": "Europe",
  uruguay: "Americas",
  usa: "Americas",
  uzbekistan: "Asia",
  vanuatu: "Oceania",
  venezuela: "Americas",
  vietnam: "Asia",
  yemen: "Asia",
  zambia: "Africa",
  zimbabwe: "Africa",
};

const DISPLAY_OVERRIDES = {
  "sao tome and principe": "S\u00E3o Tom\u00E9 and Pr\u00EDncipe",
  "timor leste": "Timor-Leste",
  "ivory coast": "C\u00F4te d'Ivoire",
  usa: "United States",
  "hong kong": "Hong Kong",
  "papua new guinea": "Papua New Guinea",
  "federated states of micronesia": "Federated States of Micronesia",
  "czech republic": "Czech Republic",
  "central african republic": "Central African Republic",
  "democratic republic of the congo": "Democratic Republic of the Congo",
  "united arab emirates": "United Arab Emirates",
  "united kingdom": "United Kingdom",
};

const toTitleCase = (input) =>
  input
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

const normalizeName = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const files = fs
  .readdirSync(ROOT)
  .filter((file) => /\.(png|jpg)$/i.test(file))
  .sort((a, b) => a.localeCompare(b));

const usedCodes = new Set();
const entries = [];

for (const file of files) {
  const baseName = path.parse(file).name;
  const normalized = normalizeName(baseName);
  if (SKIP.has(normalized)) {
    continue;
  }

  const codeOverride = CODE_BY_NAME[normalized];
  if (!codeOverride) {
    throw new Error(`Missing ISO code mapping for ${baseName}`);
  }
  const region = REGION_BY_NAME[normalized];
  if (!region) {
    throw new Error(`Missing region mapping for ${baseName}`);
  }

  const display = DISPLAY_OVERRIDES[normalized] ?? toTitleCase(baseName.replace(/_/g, " "));

  const code = codeOverride.toUpperCase();
  if (usedCodes.has(code)) {
    throw new Error(`Duplicate code ${code} for ${baseName}`);
  }
  usedCodes.add(code);

  entries.push({
    code,
    name: display,
    region,
    assetPath: `../../assets/countries/${file}`,
  });
}

entries.sort((a, b) => a.name.localeCompare(b.name));

const seedsLiteral = entries
  .map(
    (entry) => `  {
    code: "${entry.code}",
    name: "${entry.name}",
    region: "${entry.region}",
    neighbors: [],
    asset: require("${entry.assetPath.replace(/\\/g, "/")}") as ImageSourcePropType,
  }`
  )
  .join(",\n");

const fileContent = `import { ImageSourcePropType } from "react-native";

import { CountryGeometry } from "../types/country";

type CountrySeed = Omit<CountryGeometry, "asset"> & {
  asset: ImageSourcePropType;
};

const seeds: CountrySeed[] = [
${seedsLiteral}
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
`;

fs.writeFileSync(OUTPUT, fileContent, "utf8");

const jsonEntries = entries.map(({ code, name, region }) => ({ code, name, region }));

fs.writeFileSync(JSON_OUTPUT, JSON.stringify(jsonEntries, null, 2), "utf8");

console.log(`Generated ${entries.length} countries -> ${OUTPUT}`);
console.log(`Generated JSON dataset -> ${JSON_OUTPUT}`);

