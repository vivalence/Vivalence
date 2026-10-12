import { specimen } from "@vivalence/typology";
import sm2, { preview } from "../domain/retention/sm2.js";
import { drivers } from "../domain/retention/index.js";

const { describe, it, expect } = specimen;

const run = (signals) => {
  let result = sm2.encode({ enum: signals[0] });
  const retention = { state: result.state };
  for (const signal of signals.slice(1)) {
    result = sm2.evolve({ enum: signal }, retention);
    retention.state = result.state;
  }
  return result;
};

describe("sm2 — Anki's scheduler as a retention driver: encode · evolve · assess · preview · strength · sql.strength", () => {
  it("is registered under its type", () => {
    expect(drivers.SM2).toBe(sm2);
  });

  it("a first GOOD lands in learning", () => {
    const result = run(["GOOD"]);
    expect([result.status, result.state.phase, result.state.step]).toEqual(["LEARNING", "LEARNING", 1]);
  });

  it("GOOD GOOD graduates to one day", () => {
    const result = run(["GOOD", "GOOD"]);
    expect([result.state.phase, result.state.interval, result.nextIn, result.status]).toEqual(["REVIEW", 1, 24, "KNOWN"]);
  });

  it("EASY graduates at once to four days", () => {
    expect([run(["EASY"]).state.phase, run(["EASY"]).state.interval]).toEqual(["REVIEW", 4]);
  });

  it("a review GOOD multiplies by the ease", () => {
    expect([run(["GOOD", "GOOD", "GOOD"]).state.interval, run(["GOOD", "GOOD", "GOOD", "GOOD"]).state.interval]).toEqual([3, 8]);
  });

  it("an interval crossing 21 days reads GRADUATED", () => {
    const result = run(["GOOD", "GOOD", "GOOD", "GOOD", "GOOD", "GOOD"]);
    expect([result.state.interval >= 21, result.status]).toEqual([true, "GRADUATED"]);
  });

  it("AGAIN in review lapses: ease drops, relearning, the interval halves", () => {
    const before = run(["GOOD", "GOOD", "GOOD", "GOOD"]);
    const result = run(["GOOD", "GOOD", "GOOD", "GOOD", "AGAIN"]);
    expect([result.state.phase, result.state.lapses, result.state.ease, result.status]).toEqual(["RELEARNING", 1, 2.3, "UNKNOWN"]);
    expect(result.state.interval).toBe(Math.round(before.state.interval * 0.5));
  });

  it("a relearning GOOD returns to review at the lapsed interval", () => {
    const lapsed = run(["GOOD", "GOOD", "GOOD", "GOOD", "AGAIN"]);
    const result = run(["GOOD", "GOOD", "GOOD", "GOOD", "AGAIN", "GOOD"]);
    expect([result.state.phase, result.state.interval]).toEqual(["REVIEW", lapsed.state.interval]);
  });

  it("HARD in review dampens the growth and the ease", () => {
    const result = run(["GOOD", "GOOD", "HARD"]);
    expect([result.state.ease, result.state.interval]).toEqual([2.35, 1]);
  });

  it("the ease never drops below its floor", () => {
    expect(run(["GOOD", "GOOD", ...Array(10).fill("AGAIN")]).state.ease >= 1.3).toBe(true);
  });

  it("preview shows all four horizons, AGAIN soonest, EASY latest; an untouched card previews from scratch", () => {
    const horizons = preview(run(["GOOD", "GOOD"]).state);
    expect(horizons.AGAIN < horizons.HARD && horizons.HARD < horizons.GOOD && horizons.GOOD < horizons.EASY).toBe(true);
    expect(preview(null)).toEqual({ AGAIN: 1 / 60, HARD: 1 / 60, GOOD: 10 / 60, EASY: 96 });
  });

  it("a ratio signal grades by the share answered right; an unknown enum and an empty signal throw", () => {
    expect(sm2.encode({ ratio: { success: 3, total: 3 } }).state.phase).toBe("REVIEW");
    expect(sm2.encode({ ratio: { success: 1, total: 3 } }).state.step).toBe(0);
    expect(() => sm2.encode({ enum: "MAYBE" })).toThrow("Invalid SM2 signal: MAYBE");
    expect(() => sm2.encode({})).toThrow("No signal provided");
  });

  it("strength is the interval toward maturity, in SQL the same over the note's RETAINED path", () => {
    expect(sm2.strength({ state: run(["GOOD", "GOOD", "GOOD"]).state })).toBe(3 / 21);
    expect(sm2.sql.strength((field) => `json_extract(n.trait, '$.RETAINED.${field}')`)).toBe("min(1.0, coalesce(json_extract(n.trait, '$.RETAINED.state.interval'), 0.0) / 21.0)");
  });
});
