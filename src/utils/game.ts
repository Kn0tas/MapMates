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
  excludeCode?: string,
  excludeCodes: string[] = []
): RoundPayload => {
  const workingPool = pool.length ? pool : allCountries;
  const excludeSet = new Set(excludeCodes);
  if (excludeCode) {
    excludeSet.add(excludeCode);
  }

  let candidatePool = workingPool.filter((country) => !excludeSet.has(country.code));

  if (!candidatePool.length) {
    const withoutLast = excludeCode
      ? workingPool.filter((country) => country.code !== excludeCode)
      : workingPool;
    candidatePool = withoutLast.length ? withoutLast : workingPool;
  }

  const target = pickRandom(candidatePool);

  const basePool = workingPool
    .filter((candidate) => candidate.code !== target.code)
    .filter((candidate) => candidate.region === target.region);

  const fallbackPool = workingPool.filter((candidate) => candidate.code !== target.code);
  const sourcePool = basePool.length >= 3 ? basePool : fallbackPool;

  const distractorCount = Math.min(3, sourcePool.length);
  const distractors = shuffle(sourcePool).slice(0, distractorCount);

  const options = shuffle([target, ...distractors]);

  return { target, options };
};
