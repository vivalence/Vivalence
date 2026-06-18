import { assert, assertEquals } from "@std/assert";
import { GAMEPLAYS, analyze, createRun, press, project } from "./engine.js";

// Build a keystroke log by pressing keys at deterministic, monotonically
// increasing times. `press` is the only mutation in the system: it appends a
// raw { time, key } stroke and nothing else.
const log = (keys, step = 100) => {
  const strokes = [];
  keys.forEach((key, index) => press(strokes, key, index * step));
  return strokes;
};

const config = (overrides = {}) => ({
  gameplay: "PLAIN",
  forgiving: "on",
  recallMs: 1500,
  targetWpm: 40,
  ...overrides,
});

Deno.test("press appends a raw stroke and enriches nothing", () => {
  const strokes = [];
  press(strokes, "a", 5);
  press(strokes, "b", 12);
  assertEquals(strokes, [{ time: 5, key: "a" }, { time: 12, key: "b" }]);
});

Deno.test("GAMEPLAYS are composable boolean records", () => {
  assertEquals(GAMEPLAYS.PLAIN.killOnError, false);
  assertEquals(GAMEPLAYS.SUDDENDEATH.killOnError, true);
  assertEquals(GAMEPLAYS.SUDDENDEATH.requireExact, true);
  assertEquals(GAMEPLAYS.PLAIN.requireExact, false);
});

Deno.test("project: a clean run completes with green marks", () => {
  const state = project(["one"], config(), log([..."one", " "]));
  assert(state.done);
  assertEquals(state.dead, false);
  assertEquals(state.wordIndex, 1);
  assertEquals(state.marks[0], "g");
});

Deno.test("project: wrong key kills under SUDDENDEATH (emergent)", () => {
  const state = project(["one"], config({ gameplay: "SUDDENDEATH" }), log(["o", "x"]));
  assert(state.dead);
  assertEquals(state.wordIndex, 0);
});

Deno.test("project: wrong key never kills under PLAIN", () => {
  const state = project(["one"], config(), log(["o", "x", "e", " "]));
  assertEquals(state.dead, false);
  assertEquals(state.wordIndex, 1);
  assertEquals(state.marks[0], "r");
});

// The original bug: typing part of a word then pressing space committed an
// incomplete word and the run survived. Under SUDDENDEATH the commit is now
// refused (blocked, not fatal) — you must finish the word; only a wrong KEY
// kills. "on wrong key, not wrong word."
Deno.test("project: early space cannot commit an incomplete word under SUDDENDEATH", () => {
  const state = project(["one"], config({ gameplay: "SUDDENDEATH" }), log(["o", "n", " "]));
  assertEquals(state.dead, false);
  assertEquals(state.wordIndex, 0);
  assertEquals(state.typed, "on");
});

Deno.test("project: early space commits an incomplete word under PLAIN", () => {
  const state = project(["one"], config(), log(["o", "n", " "]));
  assertEquals(state.dead, false);
  assertEquals(state.wordIndex, 1);
  assertEquals(state.marks[0], "r");
});

Deno.test("project: overtyping a non-final word kills under SUDDENDEATH", () => {
  // "on" is not the last word, so it does not auto-commit; the extra "x" lands
  // past the word end (expected === undefined) and reads as a wrong key.
  const state = project(["on", "go"], config({ gameplay: "SUDDENDEATH" }), log(["o", "n", "x"]));
  assert(state.dead);
  assertEquals(state.wordIndex, 0);
});

Deno.test("project is pure: the log is never mutated and the result is stable", () => {
  const strokes = log([..."one", " "]);
  const before = strokes.length;
  const first = project(["one"], config(), strokes);
  const second = project(["one"], config(), strokes);
  assertEquals(strokes.length, before);
  assertEquals(first.wordIndex, second.wordIndex);
  assertEquals(first.marks, second.marks);
  assertEquals(first.dead, second.dead);
});

Deno.test("analyze folds the projected event stream", () => {
  const state = project(["one", "two"], config(), log([..."one", " ", ..."two", " "]));
  const report = analyze(state);
  assertEquals(report.accuracy, 1);
  assertEquals(report.C > 0, true);
  assertEquals(report.attempts.length, 2);
  assert(report.net > 0);
});

Deno.test("createRun seeds an empty log", () => {
  const run = createRun(["one"], config());
  assertEquals(run.log, []);
  assertEquals(run.words, ["one"]);
});
