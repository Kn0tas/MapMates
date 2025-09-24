import { buildRound } from "../game";

describe("buildRound", () => {
  it("returns a target and four unique options", () => {
    const { target, options } = buildRound();

    expect(target).toBeDefined();
    expect(options).toHaveLength(4);

    const codes = new Set(options.map((option) => option.code));
    expect(codes.size).toBe(4);
    expect(codes.has(target.code)).toBe(true);
  });

  it("excludes provided code from the new target", () => {
    const firstRound = buildRound();
    const secondRound = buildRound(firstRound.target.code);

    expect(secondRound.target.code).not.toBe(firstRound.target.code);
  });
});