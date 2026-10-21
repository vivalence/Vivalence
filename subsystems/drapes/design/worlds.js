const turn = (kind, text, extra = {}) => ({ kind, text, ...extra });

const you = turn("you", "play e4 and tell me why", { who: "beef", meta: "12:04" });
const agent = (status, streaming) =>
  turn("agent", "Reading the position.", {
    who: "chess · board/play",
    meta: "r3/10",
    streaming,
    tools: [
      { name: "match_board", arg: "{}", status: "ok", dur: "0.4s" },
      { name: "match_move", arg: '{ "uci": "e2e4" }', status, dur: "" },
    ],
  });
const command = turn("cmd", "/thread e4 openings", { ans: "thread e4 openings" });
const trace = turn("trace", "strip · 14 verbs", { ts: "12:04:19", path: "/anima/client/terminal/t1/strip" });
const looped = turn("agent", "", { who: "chess · board/play", meta: "r4/10", tools: [{ name: "repl_whoami", arg: "{}", status: "ok", dur: "0.1s", loop: true }] });

const base = (name, held) => ({
  name,
  entity: { label: "e4 openings", mode: "board/play" },
  harness: { tune: "capable", effort: "low", pct: 34 },
  display: { view: "docked", align: "right", lens: "chat", framed: true },
  box: { mic: "off", voice: false },
  system: { standing: "VERIFIED", health: "HEALTHY" },
  fault: false,
  terminals: [
    { index: 1, label: "e4 openings", current: true, mirrored: false, dot: "none" },
    { index: 2, label: "q3 filings", current: false, mirrored: false, dot: "none" },
    { index: 3, label: "e4 openings", current: false, mirrored: true, dot: "none" },
  ],
  consent: { name: "match_move", argument: "e2e4" },
  panel: {
    tag: "harness",
    crumbs: "ctrl-v h",
    hint: "esc steps back",
    rows: [
      { key: "t", name: "tune", choices: { options: ["frugal", "fast", "capable"], value: "capable" } },
      { key: "e", name: "effort", choices: { options: ["none", "low", "medium", "high"], value: "low" } },
      { key: "r", name: "rounds", value: "10", selected: true },
      { key: "c", name: "context", value: "34 %", icon: "◔" },
      { key: "x", name: "close frame", value: "—", off: true },
    ],
  },
  field: { kind: "turn", value: "", placeholder: "say something, or / for a line", dictating: false },
  split: { direction: "row", share: 0.42 },
  markdown: "**bene**, grazie — the *Sicilian* answers `e4` with c5.\n\n- open games\n- closed games\n\n```txt\n1. e4 c5\n```",
  json: { turn: "white", uci: "e2e4", legal: ["e2e4", "d2d4", "g1f3"], clock: { white: 300, black: 300 }, mate: null },
  html: "<p style='font-family: sans-serif'>a <b>sandboxed</b> fragment</p>",
  ...held,
});

const running = (held = {}) =>
  base("running", {
    activity: { tone: "primary", text: "match_move · r3/10 · 42s" },
    terminals: [
      { index: 1, label: "e4 openings", current: true, mirrored: false, dot: "primary" },
      { index: 2, label: "q3 filings", current: false, mirrored: false, dot: "none" },
      { index: 3, label: "e4 openings", current: false, mirrored: true, dot: "primary" },
    ],
    journal: [you, agent("run", true)],
    box: { mic: "live", voice: true },
    ...held,
  });

export const WORLDS = {
  idle: base("idle", { activity: { tone: "idle", text: "" }, journal: [command, trace, you, agent("ok", false), looped] }),
  running: running(),
  consent: running({
    name: "consent",
    activity: { tone: "caution", text: "approve match_move" },
    terminals: [
      { index: 1, label: "e4 openings", current: true, mirrored: false, dot: "caution" },
      { index: 2, label: "q3 filings", current: false, mirrored: false, dot: "none" },
    ],
    journal: [you, agent("wait", false)],
  }),
  paused: running({ name: "paused", activity: { tone: "muted", text: "paused · r3/10" }, journal: [you, agent("skip", false)], box: { mic: "muted", voice: false } }),
  faulted: base("faulted", {
    activity: { tone: "negative", text: "fault · r3" },
    fault: true,
    system: { standing: "VERIFIED", health: "DEGRADED" },
    terminals: [{ index: 1, label: "e4 openings", current: true, mirrored: false, dot: "negative" }],
    journal: [you, agent("err", false), turn("fault", "provider timeout · r3 · fs_write")],
    field: { kind: "line", value: "/resume", placeholder: "", dictating: false },
  }),
};

export const NAMES = Object.keys(WORLDS);
