import { countries } from "../data/countries";
import { CountryGeometry } from "../types/country";

export const pickRandom = <T>(items: T[]): T => {
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

export const buildRound = (excludeCode?: string): RoundPayload => {
  const pool = excludeCode
    ? countries.filter((country) => country.code !== excludeCode)
    : countries;

  const target = pickRandom(pool);

  const distractors = shuffle(
    pool.filter((candidate) => candidate.code !== target.code)
  ).slice(0, 3);

  const options = shuffle([target, ...distractors]);

  return { target, options };
};