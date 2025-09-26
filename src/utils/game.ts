import { countries as allCountries } from "../data/countries";
import { CountryGeometry } from "../types/country";

export const pickRandom = <T>(items: T[]): T => {
  if (!items.length) {
    throw new Error("Cannot pick from an empty list");
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
};

export const shuffle = <T>(items: T[]): T[] => {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

type RoundPayload = {
  target: CountryGeometry;
  options: CountryGeometry[];
};

export const buildRound = (
  pool: CountryGeometry[],
  excludeCode?: string
): RoundPayload => {
  const workingPool = pool.length ? pool : allCountries;
  const filteredPool = excludeCode
    ? workingPool.filter((country) => country.code !== excludeCode)
    : workingPool;

  const targetPool = filteredPool.length ? filteredPool : workingPool;
  const target = pickRandom(targetPool);

  const basePool = workingPool.filter((candidate) => candidate.code !== target.code);
  const distractorCount = Math.min(3, basePool.length);
  const distractors = shuffle(basePool).slice(0, distractorCount);

  const options = shuffle([target, ...distractors]);

  return { target, options };
};