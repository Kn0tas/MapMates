import { buildRound } from "../game";
import { countries } from "../../data/countries";

describe("buildRound", () => {
  it("returns a target and unique options", () => {
    const { target, options } = buildRound(countries);

    expect(target).toBeDefined();
    expect(options.length).toBeGreaterThanOrEqual(1);
    expect(options.length).toBeLessThanOrEqual(Math.min(4, countries.length));

    const codes = new Set(options.map((option) => option.code));
    expect(codes.size).toBe(options.length);
    expect(codes.has(target.code)).toBe(true);
  });

  it("tries to exclude the previous target when possible", () => {
    const firstRound = buildRound(countries);
    const secondRound = buildRound(countries, firstRound.target.code);

    if (countries.length > 1) {
      expect(secondRound.target.code).not.toBe(firstRound.target.code);
    } else {
      expect(secondRound.target.code).toBe(firstRound.target.code);
    }
  });
});