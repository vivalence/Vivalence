// ── pure math ──────────────────────────────────────────────────────────────
const mean = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const median = (values) =>
  values.length ? [...values].sort((a, b) => a - b)[values.length >> 1] : 0;
const deviation = (values) => Math.sqrt(mean(values.map((value) => (value - mean(values)) ** 2)));
const variation = (values) =>
  values.length > 1 && mean(values) > 0 ? deviation(values) / mean(values) : 0;
const kogasa = (coefficient) =>
  100 * (1 - Math.tanh(coefficient + coefficient ** 3 / 3 + coefficient ** 5 / 5));
const ascending = (selector) => (a, b) => selector(a) - selector(b);
const groupBy = (items, selector) =>
  items.reduce((groups, item) => ((groups[selector(item)] ??= []).push(item), groups), {});
const fold = (text) => text.normalize("NFD").replace(/\p{M}/gu, "");
const isHard = (character) => fold(character) !== character;

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const ADJACENCY = Object.fromEntries(
  KEYBOARD_ROWS.flatMap((row, rowIndex) =>
    [...row].map((character, index) => [
      character,
      new Set([
        ...(row[index - 1] ?? ""),
        ...(row[index + 1] ?? ""),
        ...(KEYBOARD_ROWS[rowIndex - 1]?.slice(Math.max(0, index - 1), index + 2) ?? ""),
        ...(KEYBOARD_ROWS[rowIndex + 1]?.slice(Math.max(0, index - 1), index + 2) ?? ""),
      ]),
    ]),
  ),
);
const adjacent = (a, b) => ADJACENCY[fold(a ?? "")]?.has(fold(b ?? "")) ?? false;

const sample = (pool, length) => {
  const shuffle = (items) =>
    items
      .map((item) => [Math.random(), item])
      .sort(ascending((pair) => pair[0]))
      .map((pair) => pair[1]);
  const shuffled = shuffle([...pool]);
  return shuffle(Array.from({ length }, (_, index) => shuffled[index % shuffled.length]));
};

// ── modes as composable data ─────────────────────────────────────────────────
// A gameplay is a record of constraints over the keystroke stream, ttyper-style.
// project() consults these; behaviour lives with the mode, never in scattered
// branches. New modes drop in here; nothing in the replay needs editing.
//   killOnError    — a wrong keystroke ends the run
//   requireExact   — space may only commit a word that matches the target
//   allowBackspace — backspace is honoured
const GAMEPLAYS = {
  PLAIN: { killOnError: false, requireExact: false, allowBackspace: true },
  SUDDENDEATH: { killOnError: true, requireExact: true, allowBackspace: true },
};

// Shared default config — one source for both the Svelte buffer and the TUI.
// The mode boundary (nyan.viva.js) validates incoming overrides against the
// typology `v` schema; the engine itself stays dependency-free and portable.
const defaultConfig = (overrides = {}) => ({
  source: "en",
  count: 20,
  gameplay: "PLAIN",
  forgiving: "on",
  recallMs: 1500,
  live: "shown",
  targetWpm: 40,
  ...overrides,
});

// ── the only state, and the only mutation ────────────────────────────────────
// A run is its words, its config, and an append-only log of raw keystrokes.
// Everything else — cursor, marks, liveness — is projected from the log.
const createRun = (words, config) => ({ words, config, log: [] });

const press = (log, key, time = performance.now()) => {
  log.push({ time, key });
  return log;
};

const matches = (typed, target, forgiving) =>
  forgiving ? fold(typed) === fold(target) : typed === target;

// ── the replay-fold ──────────────────────────────────────────────────────────
// project replays the raw log against the words and derives the full game state.
// `dead` and `done` are values read out of this fold, never flags mutated
// elsewhere — so a missed check can't desync liveness from the events. The same
// enriched event stream feeds analyze(), unifying live and post-hoc reads.
const project = (words, config, log) => {
  const gameplay = GAMEPLAYS[config.gameplay] ?? GAMEPLAYS.PLAIN;
  const forgiving = config.forgiving === "on";
  const events = [];
  const marks = [];
  let wordIndex = 0;
  let typed = "";
  let startedAt = null;
  let finishedAt = null;
  let dead = false;
  let deadAt = null;

  const canCommit = () => !gameplay.requireExact || matches(typed, words[wordIndex], forgiving);
  const commit = (time) => {
    const target = words[wordIndex];
    marks[wordIndex] = typed === target ? "g" : fold(typed) === fold(target) ? "y" : "r";
    events.push({ time, wordIndex, kind: "commit", typed });
    typed = "";
    wordIndex++;
    if (wordIndex >= words.length) finishedAt = time;
  };

  for (const { time, key } of log) {
    if (dead || wordIndex >= words.length) break;
    const target = words[wordIndex];

    if (key === " " || key === "\r" || key === "Enter") {
      if (typed.length && canCommit()) commit(time);
    } else if (key === "\x7f" || key === "Backspace") {
      if (typed.length && gameplay.allowBackspace) {
        events.push({ time, wordIndex, characterIndex: typed.length - 1, kind: "backspace" });
        typed = typed.slice(0, -1);
      }
    } else if (key.length === 1 && key >= " ") {
      startedAt ??= time;
      const characterIndex = typed.length;
      if (characterIndex > target.length + 3) continue;
      const expected = target[characterIndex];
      const strict = expected === key;
      const loose = expected != null && fold(expected) === fold(key);
      const ok = forgiving ? loose : strict;
      events.push({
        time,
        wordIndex,
        characterIndex,
        kind: "character",
        character: key,
        expected,
        strict,
        loose,
        ok,
      });
      typed += key;
      if (!ok && gameplay.killOnError) {
        dead = true;
        deadAt = time;
      } else if (wordIndex === words.length - 1 && typed.length >= target.length && canCommit()) {
        commit(time);
      }
    }
  }

  return {
    words,
    config,
    log,
    events,
    marks,
    wordIndex,
    typed,
    startedAt,
    finishedAt,
    dead,
    deadAt,
    done: wordIndex >= words.length,
  };
};

// ── per-word reconstruction ──────────────────────────────────────────────────
const buildAttempt = (target, wordIndex, events, previousTime) => {
  const strikes = events.filter((event) => event.kind !== "commit");
  if (!strikes.length) return null;
  const onset = strikes[0].time - previousTime;
  const intervals = strikes.slice(1).map((event, index) => event.time - strikes[index].time);
  const history = [...target].map(() => []);
  let extra = 0;
  strikes.forEach((event, index) => {
    if (event.kind !== "character") return;
    const gap = index ? event.time - strikes[index - 1].time : onset;
    event.characterIndex < target.length
      ? history[event.characterIndex].push({ ...event, gap })
      : extra++;
  });
  const cells = history.map((tries, characterIndex) => {
    const last = tries.at(-1);
    return {
      characterIndex,
      character: target[characterIndex],
      hard: isHard(target[characterIndex]),
      classification: !last
        ? "INF"
        : !last.ok
          ? "INF"
          : tries.some((entry) => !entry.ok)
            ? "IF"
            : "C",
      accentMiss: tries.some((entry) => !entry.strict && entry.loose),
      adjacent: tries.some(
        (entry) => !entry.loose && adjacent(target[characterIndex], entry.character),
      ),
      gap: last?.ok && characterIndex > 0 ? last.gap : null,
    };
  });
  return { wordIndex, target, onset, intervals, cells, extra };
};

const classify = (attempt, baseline, config, previousSame) => {
  const intervalMedian = median(attempt.intervals);
  const flow = attempt.intervals.filter((gap) => gap < config.recallMs);
  const jitter = variation(flow);
  const recall = previousSame ? 0 : attempt.onset / Math.max(config.recallMs, 3.5 * baseline);
  const hard = attempt.cells.filter((cell) => cell.hard);
  const spelling = [
    attempt.cells.some((cell) => cell.accentMiss) && "accent",
    hard.some((cell) => cell.classification !== "C") && "hard-miss",
    hard.some((cell) => (cell.gap ?? 0) > 2.5 * baseline) && "hard-pause",
  ].filter(Boolean);
  const motor = [
    intervalMedian > 1.7 * baseline && "slow",
    flow.length >= 4 && jitter > 0.85 && "jitter",
    attempt.cells.some((cell) => !cell.hard && cell.adjacent) && "adjacent",
    attempt.extra > 0 && "overshoot",
  ].filter(Boolean);
  const label =
    recall >= 1 ? "recall" : spelling.length ? "spelling" : motor.length ? "motor" : "clean";
  return {
    label,
    recall,
    spelling,
    motor,
    median: intervalMedian,
    spent: attempt.onset + attempt.intervals.reduce((sum, gap) => sum + gap, 0),
  };
};

const targetGap = (wpm) => 12000 / wpm;

const windows = (attempt, size, config) =>
  Array.from({ length: Math.max(0, attempt.cells.length - size + 1) }, (_, index) => {
    const cells = attempt.cells.slice(index, index + size);
    if (size === 1 && cells[0].characterIndex === 0) return null;
    const hardError = cells.some((cell) => cell.classification !== "C");
    const gaps = size === 1 ? [cells[0].gap] : cells.slice(1).map((cell) => cell.gap);
    return {
      unit: cells.map((cell) => fold(cell.character)).join(""),
      error: hardError || cells.some((cell) => cell.accentMiss),
      latency:
        !hardError && gaps.every((gap) => gap != null && gap < config.recallMs) ? mean(gaps) : null,
    };
  }).filter(Boolean);

const wordWindow = (attempt, config) => {
  const hardError = attempt.cells.some((cell) => cell.classification !== "C") || attempt.extra > 0;
  const gaps = attempt.cells
    .slice(1)
    .map((cell) => cell.gap)
    .filter((gap) => gap != null && gap < config.recallMs);
  return {
    unit: fold(attempt.target),
    error: hardError || attempt.cells.some((cell) => cell.accentMiss),
    latency: !hardError && gaps.length ? mean(gaps) : null,
    viscosity: variation(gaps),
  };
};

const unitStatistics = (entries, baseline, gap) =>
  Object.entries(groupBy(entries, (entry) => entry.unit)).map(([unit, group]) => {
    const latencies = group.map((entry) => entry.latency).filter((latency) => latency != null);
    const errors = group.filter((entry) => entry.error).length;
    const latency = latencies.length ? median(latencies) : null;
    const relative = latency != null ? latency / baseline : 1;
    return {
      unit,
      count: group.length,
      median: latency,
      error: errors / group.length,
      variation:
        group[0].viscosity != null
          ? mean(group.map((entry) => entry.viscosity ?? 0))
          : variation(latencies),
      damage: group.length * Math.max(0, relative - 1) ** 2 + 2 * errors,
      confidence: latency != null ? gap / latency : 0,
    };
  });

const UNIT_SIZES = { keys: 1, pairs: 2, triples: 3 };

const unitTable = (attempts, kind, config, baseline) =>
  unitStatistics(
    kind === "words"
      ? attempts.map((attempt) => wordWindow(attempt, config))
      : attempts.flatMap((attempt) => windows(attempt, UNIT_SIZES[kind], config)),
    baseline,
    targetGap(config.targetWpm),
  );

const FINGERS = {
  q: 0, a: 0, z: 0, w: 1, s: 1, x: 1, e: 2, d: 2, c: 2,
  r: 3, f: 3, v: 3, t: 3, g: 3, b: 3, y: 4, h: 4, n: 4, u: 4, j: 4, m: 4,
  i: 5, k: 5, o: 6, l: 6, p: 7,
};

const transitionClass = (previous, current) =>
  previous === current
    ? "repeat"
    : FINGERS[previous] == null || FINGERS[current] == null
      ? null
      : FINGERS[previous] === FINGERS[current]
        ? "finger"
        : (FINGERS[previous] < 4) === (FINGERS[current] < 4)
          ? "hand"
          : "alt";

const transitions = (attempts, config) => {
  const pairs = attempts
    .flatMap((attempt) => windows(attempt, 2, config))
    .filter((entry) => entry.latency != null)
    .map((entry) => ({
      kind: transitionClass(entry.unit[0], entry.unit[1]),
      latency: entry.latency,
    }))
    .filter((entry) => entry.kind);
  return ["alt", "hand", "finger", "repeat"]
    .map((kind) => ({
      kind,
      median: median(pairs.filter((entry) => entry.kind === kind).map((entry) => entry.latency)),
      count: pairs.filter((entry) => entry.kind === kind).length,
    }))
    .filter((entry) => entry.count > 0);
};

const ORDERS = {
  damage: (unit) => -unit.damage,
  slow: (unit) => (unit.median == null ? 1 : -unit.median),
  unstable: (unit) => -(unit.variation || 0),
  errors: (unit) => -unit.error,
};

const LANES = ["recall", "spelling", "motor", "clean"];

const DIVES = ["graph", "words", "units"];

// ── post-hoc analysis: a fold over the same projected event stream ───────────
const analyze = (state) => {
  const { words, events, config } = state;
  const startedAt = state.startedAt ?? events[0]?.time ?? 0;
  const byWord = groupBy(events, (event) => event.wordIndex);
  const lastTime = (group) => group.at(-1).time;
  const attempts = words
    .map(
      (word, index) =>
        byWord[index] &&
        buildAttempt(
          word,
          index,
          byWord[index],
          index && byWord[index - 1] ? lastTime(byWord[index - 1]) : startedAt,
        ),
    )
    .filter(Boolean);
  const baseline = Math.max(80, median(attempts.flatMap((attempt) => attempt.intervals)));
  const labeled = attempts.map((attempt) => ({
    ...attempt,
    ...classify(attempt, baseline, config, words[attempt.wordIndex - 1] === attempt.target),
  }));
  const cells = labeled.flatMap((attempt) => attempt.cells);
  const C = cells.filter((cell) => cell.classification === "C").length;
  const IF = cells.filter((cell) => cell.classification === "IF").length;
  const INF =
    cells.filter((cell) => cell.classification === "INF").length +
    labeled.reduce((sum, attempt) => sum + attempt.extra, 0);
  const accuracy = C / Math.max(1, C + IF + INF);
  const gaps = events.slice(1).map((event, index) => event.time - events[index].time);
  const raw = gaps.length ? (gaps.length / (gaps.reduce((sum, gap) => sum + gap, 0) / 1000)) * 12 : 0;
  const strikes = events.filter((event) => event.kind === "character");
  const strikeGaps = strikes
    .slice(1)
    .map((event, index) => event.time - strikes[index].time)
    .filter((gap) => gap < config.recallMs);
  const sweep = (size) => {
    if (strikeGaps.length < size) return null;
    let best = 0;
    let worst = Infinity;
    for (let index = 0; index + size <= strikeGaps.length; index++) {
      const wpm = 12000 / mean(strikeGaps.slice(index, index + size));
      if (wpm > best) best = wpm;
      if (wpm < worst) worst = wpm;
    }
    return { best, worst };
  };
  return {
    attempts: labeled,
    baseline,
    raw,
    net: raw * accuracy,
    accuracy,
    C,
    IF,
    INF,
    consistency: kogasa(
      variation(
        labeled.flatMap((attempt) => attempt.intervals).filter((gap) => gap < config.recallMs),
      ),
    ),
    span: ((state.finishedAt || events.at(-1)?.time || startedAt) - startedAt) / 1000,
    accents: cells.filter((cell) => cell.accentMiss).length,
    accentSlips: Object.entries(
      groupBy(
        cells.filter((cell) => cell.accentMiss),
        (cell) => cell.character,
      ),
    )
      .map(([character, group]) => ({ character, count: group.length }))
      .sort(ascending((entry) => -entry.count)),
    backspaces: events.filter((event) => event.kind === "backspace").length,
    peak: sweep(10),
    tempo: labeled.map((attempt) => ({
      label: attempt.label,
      wpm: attempt.median ? 12000 / attempt.median : 0,
      onset: attempt.onset,
      seconds: (lastTime(byWord[attempt.wordIndex]) - startedAt) / 1000,
      target: attempt.target,
    })),
    units: Object.fromEntries(
      ["keys", "pairs", "triples", "words"].map((kind) => [
        kind,
        unitTable(labeled, kind, config, baseline),
      ]),
    ),
    transitions: transitions(labeled, config),
  };
};

const note = (attempt) =>
  attempt.label === "recall"
    ? (attempt.onset / 1000).toFixed(1) + "s"
    : attempt.label === "spelling"
      ? attempt.spelling[0]
      : attempt.label === "motor"
        ? attempt.motor[0]
        : "";

// ── live folds over an in-progress projection ────────────────────────────────
const speedline = (state, window = 10) => {
  const strikes = state.events.filter((event) => event.kind === "character");
  const start = state.startedAt ?? strikes[0]?.time ?? 0;
  const points = [];
  for (let index = window; index < strikes.length; index++) {
    const gaps = [];
    for (let cursor = index - window + 1; cursor <= index; cursor++)
      gaps.push(strikes[cursor].time - strikes[cursor - 1].time);
    const flow = gaps.filter((gap) => gap < state.config.recallMs);
    if (!flow.length) continue;
    points.push({ seconds: (strikes[index].time - start) / 1000, wpm: 12000 / mean(flow) });
  }
  return points;
};

const pulse = (state, fastWindow = 3, slowWindow = 10) => {
  const strikes = state.events.filter((event) => event.kind === "character");
  const gaps = strikes.slice(1).map((event, index) => event.time - strikes[index].time);
  const over = (window) => {
    const slice = gaps.slice(-window);
    return slice.length ? 12000 / mean(slice) : 0;
  };
  const accuracy = strikes.length
    ? (100 * strikes.filter((event) => event.ok).length) / strikes.length
    : 100;
  return { fast: over(fastWindow), slow: over(slowWindow), accuracy };
};

const liveStats = (state) => {
  const gaps = state.events.slice(1).map((event, index) => event.time - state.events[index].time);
  const wpm = gaps.length ? (gaps.length / (gaps.reduce((sum, gap) => sum + gap, 0) / 1000)) * 12 : 0;
  const characters = state.events.filter((event) => event.kind === "character");
  const accuracy = characters.length
    ? (100 * characters.filter((event) => event.ok).length) / characters.length
    : 100;
  return `${wpm.toFixed(0)} wpm · ${accuracy.toFixed(0)}%`;
};

const characterClass = (expected, character) =>
  expected === character ? "g" : expected != null && fold(expected) === fold(character) ? "y" : "r";

export {
  mean,
  median,
  deviation,
  variation,
  kogasa,
  ascending,
  groupBy,
  fold,
  isHard,
  adjacent,
  sample,
  GAMEPLAYS,
  defaultConfig,
  createRun,
  press,
  matches,
  project,
  buildAttempt,
  classify,
  targetGap,
  windows,
  wordWindow,
  unitTable,
  UNIT_SIZES,
  FINGERS,
  transitionClass,
  transitions,
  ORDERS,
  LANES,
  DIVES,
  analyze,
  note,
  pulse,
  speedline,
  liveStats,
  characterClass,
};
