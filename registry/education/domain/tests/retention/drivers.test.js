import { specimen } from "@vivalence/typology";
import drivers from "../../retention/index.js";
import boolean from "../../retention/boolean.js";
import counter from "../../retention/counter.js";
import bayesian from "../../retention/bayesian.js";
import { RetentionEntity, RetentionDriverEnum, RetentionStatusEnum } from "../../entities/userspace/Retention.ts";
import { STATUS, SIGNAL } from "../../types.js";

const signal = (value) => ({ enum: value });

specimen.describe("retention drivers — the registry", () => {
  specimen.it("registers every driver under its type, each with encode · evolve · assess · sql.strength", () => {
    specimen.expect(Object.keys(drivers).sort()).toEqual(["BAYESIAN", "BOOLEAN", "COUNTER"]);
    for (const driver of Object.values(drivers)) {
      specimen.expect(typeof driver.encode).toBe("function");
      specimen.expect(typeof driver.evolve).toBe("function");
      specimen.expect(typeof driver.assess).toBe("function");
      specimen.expect(typeof driver.sql.strength("m")).toBe("string");
    }
    specimen.expect(Object.keys(drivers).sort()).toEqual(Object.values(RetentionDriverEnum).sort());
  });

  specimen.it("every driver speaks the domain's status ladder and accepts every domain signal", () => {
    for (const driver of Object.values(drivers)) {
      for (const value of SIGNAL) {
        const encoded = driver.encode(signal(value));
        specimen.expect(STATUS).toContain(encoded.status);
        specimen.expect(Object.values(RetentionStatusEnum)).toContain(encoded.status);
        const evolved = driver.evolve(signal(value), { state: encoded.state, lastAt: new Date(Date.now() - 3600000), traces: [] });
        specimen.expect(STATUS).toContain(evolved.status);
        specimen.expect(evolved.nextAt instanceof Date || typeof evolved.nextAt === "string").toBe(true);
        specimen.expect(typeof evolved.nextIn).toBe("number");
      }
    }
  });

  specimen.it("a compound signal {enum, ratio} evolves on the RATIO — the enum is the trace label", () => {
    const base = bayesian.encode({ enum: "NEUTRAL" });
    const retention = () => ({ state: base.state, lastAt: new Date(Date.now() - 3600000), traces: [] });
    const halflife = (result) => result.state[2];
    const full = bayesian.evolve({ enum: "NEUTRAL", ratio: { success: 8, total: 8 } }, retention());
    const most = bayesian.evolve({ enum: "NEUTRAL", ratio: { success: 6, total: 8 } }, retention());
    const none = bayesian.evolve({ enum: "NEUTRAL", ratio: { success: 0, total: 8 } }, retention());
    const enumOnly = bayesian.evolve({ enum: "NEUTRAL" }, retention());
    specimen.expect(halflife(full)).toBeGreaterThan(halflife(most));
    specimen.expect(halflife(most)).toBeGreaterThan(halflife(none));
    specimen.expect(halflife(full)).not.toBe(halflife(enumOnly));
    specimen.expect(boolean.evolve({ enum: "SUCCESS", ratio: { success: 0, total: 8 } }, retention()).state).toBe(false);
  });

  specimen.it("refuses an empty signal", () => {
    for (const driver of Object.values(drivers)) {
      let threw = false;
      try {
        driver.encode({});
      } catch {
        threw = true;
      }
      specimen.expect(threw).toBe(true);
    }
  });
});

specimen.describe("boolean driver — known or not, nothing between", () => {
  specimen.it("positive signals graduate, negative ones stay unknown, both on encode and evolve", () => {
    for (const value of ["MASTERY", "SUCCESS", "NEUTRAL"]) {
      specimen.expect(boolean.encode(signal(value))).toMatchObject({ state: true, status: "GRADUATED", nextIn: 9999999 });
      specimen.expect(boolean.evolve(signal(value), { state: false })).toMatchObject({ state: true, status: "GRADUATED" });
    }
    for (const value of ["MISTAKE", "FAILURE"]) {
      specimen.expect(boolean.encode(signal(value))).toMatchObject({ state: false, status: "UNKNOWN", nextIn: 0 });
      specimen.expect(boolean.evolve(signal(value), { state: true })).toMatchObject({ state: false, status: "UNKNOWN" });
    }
  });

  specimen.it("ratios: encode needs half, evolve needs a third", () => {
    specimen.expect(boolean.encode({ ratio: { success: 1, total: 2 } }).state).toBe(true);
    specimen.expect(boolean.encode({ ratio: { success: 1, total: 3 } }).state).toBe(false);
    specimen.expect(boolean.evolve({ ratio: { success: 1, total: 3 } }, { state: false }).state).toBe(true);
    specimen.expect(boolean.evolve({ ratio: { success: 1, total: 4 } }, { state: true }).state).toBe(false);
  });

  specimen.it("assess: no state = UNTOUCHED, due now", () => {
    specimen.expect(boolean.assess({ state: undefined })).toMatchObject({ status: "UNTOUCHED", nextIn: 0 });
  });
});

specimen.describe("counter driver — a streak schedule", () => {
  specimen.it("encode starts the streak on a hit and zeroes it on a miss", () => {
    specimen.expect(counter.encode(signal("SUCCESS"))).toMatchObject({ state: { streak: 1, total: 1, successes: 1 }, status: "UNKNOWN", nextIn: 1 });
    specimen.expect(counter.encode(signal("FAILURE"))).toMatchObject({ state: { streak: 0, total: 1, successes: 0 }, status: "UNKNOWN", nextIn: 1 });
  });

  specimen.it("climbs UNKNOWN → LEARNING (2) → KNOWN (5) → GRADUATED (8) along the schedule, and a miss resets the streak but not the totals", () => {
    let retention = { state: counter.encode(signal("SUCCESS")).state };
    const seen = [];
    for (let index = 0; index < 8; index += 1) {
      const next = counter.evolve(signal("SUCCESS"), retention);
      seen.push([next.state.streak, next.status, next.nextIn]);
      retention = { state: next.state };
    }
    specimen.expect(seen.map(([streak]) => streak)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    specimen.expect(seen.map(([, status]) => status)).toEqual(["LEARNING", "LEARNING", "LEARNING", "KNOWN", "KNOWN", "KNOWN", "GRADUATED", "GRADUATED"]);
    specimen.expect(seen.map(([, , nextIn]) => nextIn)).toEqual([24, 24, 24, 168, 168, 168, 9999999, 9999999]);
    const missed = counter.evolve(signal("MISTAKE"), retention);
    specimen.expect(missed.state).toEqual({ streak: 0, total: 10, successes: 9 });
    specimen.expect(missed.status).toBe("UNKNOWN");
  });

  specimen.it("requires an enum signal", () => {
    let threw = false;
    try {
      counter.encode({ ratio: { success: 1, total: 1 } });
    } catch {
      threw = true;
    }
    specimen.expect(threw).toBe(true);
  });
});

specimen.describe("RetentionEntity.evolve — the entity applies a driver's verdict", () => {
  const fresh = () => {
    const retention = new RetentionEntity();
    retention.state = null;
    retention.status = RetentionStatusEnum.UNTOUCHED;
    return retention;
  };

  specimen.it("encodes on first signal, evolves after, accepts a bare string signal, stamps lastAt", () => {
    const retention = fresh();
    const before = Date.now();
    const first = retention.evolve("SUCCESS", bayesian);
    specimen.expect(first.signal).toEqual({ enum: "SUCCESS" });
    specimen.expect(retention.state).toEqual(first.state);
    specimen.expect(retention.status).toBe(first.status);
    specimen.expect(retention.nextAt.getTime()).toBeGreaterThan(before);
    specimen.expect(retention.lastAt.getTime()).toBeGreaterThanOrEqual(before);
    const firstNext = retention.nextAt.getTime();
    retention.evolve({ enum: "FAILURE" }, bayesian);
    specimen.expect(retention.nextAt.getTime()).toBeLessThan(firstNext);
    specimen.expect(["UNKNOWN", "LEARNING"]).toContain(retention.status);
  });

  specimen.it("is: the ladder predicates read status and lastSignal", () => {
    const retention = fresh();
    specimen.expect(retention.is.virgin).toBe(true);
    retention.status = RetentionStatusEnum.KNOWN;
    retention.lastSignal = "SUCCESS";
    specimen.expect(retention.is).toMatchObject({ virgin: false, weak: false, familiar: true, strong: true, succeeded: true, failed: false });
    retention.status = RetentionStatusEnum.UNKNOWN;
    retention.lastSignal = "MISTAKE";
    specimen.expect(retention.is).toMatchObject({ weak: true, familiar: false, strong: false, succeeded: false, failed: true });
  });

  specimen.it("every driver runs through the entity, statuses stay inside the enum", () => {
    for (const driver of Object.values(drivers)) {
      const retention = fresh();
      for (const value of ["SUCCESS", "SUCCESS", "MISTAKE", "SUCCESS", "MASTERY"]) {
        retention.evolve(value, driver);
        specimen.expect(Object.values(RetentionStatusEnum)).toContain(retention.status);
      }
    }
  });
});
