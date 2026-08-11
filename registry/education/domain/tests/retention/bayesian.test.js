import { specimen } from "@vivalence/typology";
import bayesian from "../../retention/bayesian.js";

// ── helpers ─────────────────────────────────────────────────────────

const signal = (e) => ({ enum: e });
const ratio = (s, t) => ({ ratio: { success: s, total: t } });

const retention = (state, hoursAgo = 1) => ({
  state,
  lastAt: new Date(Date.now() - hoursAgo * 3600000),
  traces: [],
});

const fresh = (sig = "SUCCESS") => bayesian.encode(signal(sig));

// ── encode ──────────────────────────────────────────────────────────

specimen.describe("bayesian / encode", () => {
  specimen.it("creates a 3-element ebisu state", () => {
    const { state } = fresh();
    specimen.expect(Array.isArray(state)).toBe(true);
    specimen.expect(state.length).toBe(3);
  });

  specimen.it("alpha and beta are 4", () => {
    const { state } = fresh();
    specimen.expect(state[0]).toBe(4);
    specimen.expect(state[1]).toBe(4);
  });

  specimen.it("MASTERY gets highest halflife", () => {
    const mastery = fresh("MASTERY");
    const success = fresh("SUCCESS");
    specimen.expect(mastery.state[2]).toBeGreaterThan(success.state[2]);
  });

  specimen.it("FAILURE gets lowest halflife", () => {
    const failure = fresh("FAILURE");
    const mistake = fresh("MISTAKE");
    specimen.expect(failure.state[2]).toBeLessThan(mistake.state[2]);
  });

  specimen.it("tau values match signal strength ordering", () => {
    const taus = ["FAILURE", "MISTAKE", "NEUTRAL", "SUCCESS", "MASTERY"]
      .map((e) => fresh(e).state[2]);
    for (let i = 1; i < taus.length; i++) {
      specimen.expect(taus[i]).toBeGreaterThan(taus[i - 1]);
    }
  });

  specimen.it("returns status and schedule", () => {
    const result = fresh();
    specimen.expect(result.status).toBeTruthy();
    specimen.expect(typeof result.nextIn).toBe("number");
    specimen.expect(result.nextAt instanceof Date).toBe(true);
  });

  specimen.it("ratio signal produces state", () => {
    const result = bayesian.encode(ratio(1, 1));
    specimen.expect(result.state.length).toBe(3);
  });

  specimen.it("ratio 1.0 gets highest tau", () => {
    const perfect = bayesian.encode(ratio(1, 1));
    const poor = bayesian.encode(ratio(0.5, 1));
    specimen.expect(perfect.state[2]).toBeGreaterThan(poor.state[2]);
  });

  specimen.it("throws on empty signal", () => {
    specimen.expect(() => bayesian.encode({})).toThrow();
  });
});

// ── evolve ──────────────────────────────────────────────────────────

specimen.describe("bayesian / evolve", () => {
  specimen.it("SUCCESS increases halflife", () => {
    const init = fresh();
    const eng = retention(init.state, 2);
    const evolved = bayesian.evolve(signal("SUCCESS"), eng);
    specimen.expect(evolved.state[2]).toBeGreaterThan(init.state[2]);
  });

  specimen.it("FAILURE decreases halflife", () => {
    const init = fresh();
    const eng = retention(init.state, 2);
    const evolved = bayesian.evolve(signal("FAILURE"), eng);
    specimen.expect(evolved.state[2]).toBeLessThan(init.state[2]);
  });

  specimen.it("MASTERY boosts halflife more than SUCCESS", () => {
    const init = fresh();
    const eng = retention(init.state, 2);
    const mastery = bayesian.evolve(signal("MASTERY"), eng);
    const success = bayesian.evolve(signal("SUCCESS"), eng);
    specimen.expect(mastery.state[2]).toBeGreaterThan(success.state[2]);
  });

  specimen.it("FAILURE punishes halflife more than MISTAKE", () => {
    const init = fresh();
    const eng = retention(init.state, 2);
    const failure = bayesian.evolve(signal("FAILURE"), eng);
    const mistake = bayesian.evolve(signal("MISTAKE"), eng);
    specimen.expect(failure.state[2]).toBeLessThan(mistake.state[2]);
  });

  specimen.it("NEUTRAL is between SUCCESS and MISTAKE", () => {
    const init = fresh();
    const eng = retention(init.state, 2);
    const success = bayesian.evolve(signal("SUCCESS"), eng);
    const neutral = bayesian.evolve(signal("NEUTRAL"), eng);
    const mistake = bayesian.evolve(signal("MISTAKE"), eng);
    specimen.expect(neutral.state[2]).toBeLessThan(success.state[2]);
    specimen.expect(neutral.state[2]).toBeGreaterThan(mistake.state[2]);
  });

  specimen.it("rescaleHalflife applies to updated state (bug regression)", () => {
    const init = fresh();
    const eng = retention(init.state, 2);
    const mastery = bayesian.evolve(signal("MASTERY"), eng);
    // rescale(3) on updated state should differ from rescale(3) on original
    // the halflife should be > 3x original (updateRecall + rescale compound)
    specimen.expect(mastery.state[2]).toBeGreaterThan(init.state[2] * 3);
  });

  specimen.it("ratio evolve works", () => {
    const init = fresh();
    const eng = retention(init.state, 2);
    const evolved = bayesian.evolve(ratio(1, 1), eng);
    specimen.expect(evolved.state[2]).toBeGreaterThan(init.state[2]);
  });

  specimen.it("throws on invalid enum", () => {
    const init = fresh();
    const eng = retention(init.state, 1);
    specimen.expect(() => bayesian.evolve(signal("BOGUS"), eng)).toThrow();
  });
});

// ── assess ──────────────────────────────────────────────────────────

specimen.describe("bayesian / assess", () => {
  specimen.it("UNKNOWN for very short halflife", () => {
    const init = fresh("FAILURE");
    const { status } = bayesian.assess({ state: init.state });
    specimen.expect(status).toBe("UNKNOWN");
  });

  specimen.it("GRADUATED for very long halflife", () => {
    const init = fresh("MASTERY");
    // pump it up with repeated mastery
    let state = init.state;
    for (let i = 0; i < 10; i++) {
      const eng = retention(state, 24);
      state = bayesian.evolve(signal("MASTERY"), eng).state;
    }
    const { status } = bayesian.assess({ state });
    specimen.expect(status).toBe("GRADUATED");
  });

  specimen.it("status progresses through tiers", () => {
    let state = fresh("SUCCESS").state;
    const statuses = [];
    for (let i = 0; i < 20; i++) {
      const eng = retention(state, state[2] * 0.8);
      const result = bayesian.evolve(signal("SUCCESS"), eng);
      state = result.state;
      statuses.push(result.status);
    }
    // should see progression from early to later statuses
    const first = statuses[0];
    const last = statuses[statuses.length - 1];
    const order = ["UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];
    specimen.expect(order.indexOf(last)).toBeGreaterThanOrEqual(order.indexOf(first));
  });
});

// ── behavioral: spaced repetition properties ────────────────────────

specimen.describe("bayesian / behavior", () => {
  specimen.it("consecutive successes increase intervals monotonically", () => {
    let state = fresh("SUCCESS").state;
    const intervals = [];
    for (let i = 0; i < 10; i++) {
      const eng = retention(state, state[2] * 0.5);
      const result = bayesian.evolve(signal("SUCCESS"), eng);
      state = result.state;
      intervals.push(result.nextIn);
    }
    for (let i = 1; i < intervals.length; i++) {
      specimen.expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }
  });

  specimen.it("a single failure resets progress significantly", () => {
    let state = fresh("SUCCESS").state;
    // build up with 5 successes
    for (let i = 0; i < 5; i++) {
      const eng = retention(state, state[2] * 0.5);
      state = bayesian.evolve(signal("SUCCESS"), eng).state;
    }
    const beforeFailure = state[2];
    const eng = retention(state, state[2] * 0.5);
    const after = bayesian.evolve(signal("FAILURE"), eng);
    // halflife should drop substantially
    specimen.expect(after.state[2]).toBeLessThan(beforeFailure * 0.5);
  });

  specimen.it("reviewing on time vs late affects outcome", () => {
    const state = fresh("SUCCESS").state;
    const onTime = bayesian.evolve(signal("SUCCESS"), retention(state, state[2] * 0.5));
    const late = bayesian.evolve(signal("SUCCESS"), retention(state, state[2] * 3));
    // reviewing late with success should boost more (surprised you remembered)
    specimen.expect(late.state[2]).toBeGreaterThan(onTime.state[2]);
  });

  specimen.it("reviewing late with success boosts more than early with failure", () => {
    const state = fresh("SUCCESS").state;
    const lateSuccess = bayesian.evolve(signal("SUCCESS"), retention(state, state[2] * 3));
    const earlyFailure = bayesian.evolve(signal("FAILURE"), retention(state, state[2] * 0.1));
    specimen.expect(lateSuccess.state[2]).toBeGreaterThan(earlyFailure.state[2]);
  });

  specimen.it("decay threshold 0.5 means nextIn ≈ halflife", () => {
    const { state, nextIn } = fresh("SUCCESS");
    const halflife = state[2];
    // nextIn should be approximately the halflife (within 20%)
    specimen.expect(Math.abs(nextIn - halflife) / halflife).toBeLessThan(0.2);
  });
});

// ── stress: push ebisu to extremes ──────────────────────────────────

specimen.describe("bayesian / stress", () => {
  specimen.it("100 consecutive successes don't crash", () => {
    let state = fresh("SUCCESS").state;
    for (let i = 0; i < 100; i++) {
      const eng = retention(state, Math.max(state[2] * 0.5, 0.01));
      const result = bayesian.evolve(signal("SUCCESS"), eng);
      state = result.state;
      specimen.expect(Number.isFinite(state[0])).toBe(true);
      specimen.expect(Number.isFinite(state[1])).toBe(true);
      specimen.expect(Number.isFinite(state[2])).toBe(true);
    }
  });

  specimen.it("100 consecutive failures don't crash (halflife floors at clamp)", () => {
    let state = fresh("SUCCESS").state;
    for (let i = 0; i < 100; i++) {
      const eng = retention(state, Math.max(state[2] * 0.5, 0.01));
      const result = bayesian.evolve(signal("FAILURE"), eng);
      state = result.state;
      specimen.expect(Number.isFinite(state[0])).toBe(true);
      specimen.expect(Number.isFinite(state[1])).toBe(true);
      specimen.expect(state[2]).toBeGreaterThan(0);
    }
    // halflife bottoms out at clamp minimum
    specimen.expect(state[2]).toBe(0.01);
  });

  specimen.it("alternating mastery/failure doesn't diverge", () => {
    let state = fresh("SUCCESS").state;
    for (let i = 0; i < 50; i++) {
      const sig = i % 2 === 0 ? "MASTERY" : "FAILURE";
      const eng = retention(state, Math.max(state[2] * 0.5, 0.01));
      const result = bayesian.evolve(signal(sig), eng);
      state = result.state;
      specimen.expect(Number.isFinite(state[0])).toBe(true);
      specimen.expect(Number.isFinite(state[1])).toBe(true);
      specimen.expect(state[2]).toBeGreaterThan(0);
      specimen.expect(state[2]).toBeLessThan(1e12);
    }
  });

  specimen.it("very long elapsed time doesn't crash", () => {
    const state = fresh("SUCCESS").state;
    // 1 year elapsed
    const eng = retention(state, 8760);
    const result = bayesian.evolve(signal("SUCCESS"), eng);
    specimen.expect(Number.isFinite(result.state[2])).toBe(true);
  });

  specimen.it("very short elapsed time doesn't crash", () => {
    const state = fresh("SUCCESS").state;
    // 1 second elapsed
    const eng = retention(state, 1 / 3600);
    const result = bayesian.evolve(signal("SUCCESS"), eng);
    specimen.expect(Number.isFinite(result.state[2])).toBe(true);
  });

  specimen.it("50 consecutive successes stay finite", () => {
    let state = fresh("SUCCESS").state;
    for (let i = 0; i < 50; i++) {
      const elapsed = Math.max(state[2] * 0.5, 0.1);
      const eng = retention(state, elapsed);
      state = bayesian.evolve(signal("SUCCESS"), eng).state;
    }
    specimen.expect(Number.isFinite(state[0])).toBe(true);
    specimen.expect(Number.isFinite(state[1])).toBe(true);
    specimen.expect(Number.isFinite(state[2])).toBe(true);
    specimen.expect(state[0]).toBeGreaterThan(4);
  });

  specimen.it("mastery spam clamps at ceiling", () => {
    let state = fresh("MASTERY").state;
    for (let i = 0; i < 30; i++) {
      const eng = retention(state, Math.max(state[2] * 0.1, 0.1));
      state = bayesian.evolve(signal("MASTERY"), eng).state;
    }
    specimen.expect(Number.isFinite(state[2])).toBe(true);
    // halflife capped at 10 years
    specimen.expect(state[2]).toBeLessThanOrEqual(24 * 365 * 10);
  });

  specimen.it("failure spam clamps at floor", () => {
    let state = fresh("FAILURE").state;
    for (let i = 0; i < 30; i++) {
      const eng = retention(state, Math.max(state[2] * 0.5, 0.01));
      state = bayesian.evolve(signal("FAILURE"), eng).state;
    }
    specimen.expect(state[2]).toBeGreaterThanOrEqual(0.01);
    specimen.expect(Number.isFinite(state[2])).toBe(true);
  });

  specimen.it("assess on extreme states returns valid results", () => {
    // enormous halflife
    const big = bayesian.assess({ state: [100, 100, 999999] });
    specimen.expect(big.status).toBe("GRADUATED");
    specimen.expect(Number.isFinite(big.nextIn)).toBe(true);

    // tiny halflife
    const tiny = bayesian.assess({ state: [4, 4, 0.001] });
    specimen.expect(tiny.status).toBe("UNKNOWN");
    specimen.expect(Number.isFinite(tiny.nextIn)).toBe(true);
  });

  specimen.it("ratio with extreme values", () => {
    const state = fresh("SUCCESS").state;
    const eng = retention(state, 1);
    // 0/10 — total failure
    const zero = bayesian.evolve(ratio(0, 10), eng);
    specimen.expect(Number.isFinite(zero.state[2])).toBe(true);
    // 1/1 — perfect
    const perfect = bayesian.evolve(ratio(1, 1), eng);
    specimen.expect(Number.isFinite(perfect.state[2])).toBe(true);
  });

  specimen.it("sql.strength returns valid SQL fragment", () => {
    const sql = bayesian.sql.strength("m0");
    specimen.expect(sql).toContain("m0.lastAt");
    specimen.expect(sql).toContain("m0.state");
    specimen.expect(sql).toContain("exp(");
  });
});
