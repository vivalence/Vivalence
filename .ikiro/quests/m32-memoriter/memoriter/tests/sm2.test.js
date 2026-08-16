import { assertEquals, assert } from "@std/assert";
import sm2 from "../domain/retention/sm2.js";

const run = (signals) => {
  let result = sm2.encode({ enum: signals[0] });
  const retention = { state: result.state, lastAt: new Date() };
  for (const signal of signals.slice(1)) {
    result = sm2.evolve({ enum: signal }, retention);
    retention.state = result.state;
  }
  return result;
};

Deno.test("first GOOD lands in learning", () => {
  const r = run(["GOOD"]);
  assertEquals(r.status, "LEARNING");
  assertEquals(r.state.phase, "LEARNING");
  assertEquals(r.state.step, 1);
});

Deno.test("GOOD GOOD graduates to one day", () => {
  const r = run(["GOOD", "GOOD"]);
  assertEquals(r.state.phase, "REVIEW");
  assertEquals(r.state.interval, 1);
  assertEquals(r.nextIn, 24);
  assertEquals(r.status, "KNOWN");
});

Deno.test("EASY graduates immediately to four days", () => {
  const r = run(["EASY"]);
  assertEquals(r.state.phase, "REVIEW");
  assertEquals(r.state.interval, 4);
});

Deno.test("review GOOD multiplies by ease", () => {
  const r = run(["GOOD", "GOOD", "GOOD"]);
  assertEquals(r.state.interval, 3);
  const again = run(["GOOD", "GOOD", "GOOD", "GOOD"]);
  assertEquals(again.state.interval, 8);
});

Deno.test("interval crossing 21 days reads GRADUATED", () => {
  const r = run(["GOOD", "GOOD", "GOOD", "GOOD", "GOOD", "GOOD"]);
  assert(r.state.interval >= 21);
  assertEquals(r.status, "GRADUATED");
});

Deno.test("AGAIN in review lapses: ease drops, relearning, interval halves", () => {
  const before = run(["GOOD", "GOOD", "GOOD", "GOOD"]);
  const r = run(["GOOD", "GOOD", "GOOD", "GOOD", "AGAIN"]);
  assertEquals(r.state.phase, "RELEARNING");
  assertEquals(r.state.lapses, 1);
  assertEquals(r.state.ease, 2.3);
  assertEquals(r.state.interval, Math.round(before.state.interval * 0.5));
  assertEquals(r.status, "UNKNOWN");
});

Deno.test("relearning GOOD returns to review at prior interval", () => {
  const r = run(["GOOD", "GOOD", "GOOD", "GOOD", "AGAIN", "GOOD"]);
  assertEquals(r.state.phase, "REVIEW");
  assert(r.state.interval >= 1);
});

Deno.test("HARD in review dampens growth and ease", () => {
  const r = run(["GOOD", "GOOD", "HARD"]);
  assertEquals(r.state.ease, 2.35);
  assertEquals(r.state.interval, 1);
});

Deno.test("ease never drops below the floor", () => {
  const r = run(["GOOD", "GOOD", ...Array(10).fill("AGAIN")]);
  assert(r.state.ease >= 1.3);
});

Deno.test("preview shows all four horizons", () => {
  const p = sm2.preview(run(["GOOD", "GOOD"]).state);
  assert(p.AGAIN < p.HARD);
  assert(p.HARD < p.GOOD);
  assert(p.GOOD < p.EASY);
});
