const sample = (fn) => {
  const world = {
    name: "idle",
    entity: { label: "e4 openings", mode: "board/play" },
    harness: { tune: "capable", context: 0.34, effort: "low", rounds: 10 },
    activity: { signal: "off", text: "idle", tool: null },
    display: { view: "docked", align: "right" },
    system: { standing: "VERIFIED", host: "ghost" },
    lens: "chat",
    hint: "ctrl-v keys · twice repl · click a segment",
    chord: false,
    open: null,
    tabs: [
      { index: 1, label: "e4 openings", current: true, signal: null, shared: false },
      { index: 2, label: "reading notes", current: false, signal: null, shared: false },
    ],
    panel: {
      tag: "harness",
      crumbs: "ctrl-v h",
      hint: "esc drops",
      rows: [
        { key: "t", label: "tune", choices: { options: ["frugal", "fast", "capable"], value: "capable" } },
        { key: "e", label: "effort", choices: { options: ["none", "low", "medium", "high"], value: "low" } },
        { key: "r", label: "rounds", value: "10", selected: true },
        { key: "u", label: "close frame", value: "—", off: true },
      ],
    },
    journal: [
      { register: "you", who: "beef", meta: "09:14", text: "what does the king's pawn do in the opening?" },
      {
        register: "agent",
        meta: "0.7s · 2 calls",
        text: "It claims the centre and opens the diagonals.\n\n- 1. e4 e5\n- 2. Nf3",
        calls: [
          { name: "match_board", arg: "{}", status: "ok", duration: "0.4s" },
          { name: "repl_whoami", arg: '{ "body": [], "flags": {} }', status: "ok", duration: "0.3s", loop: true },
        ],
      },
      { register: "cmd", text: "/tune fast", answer: "tune fast" },
      { register: "trace", text: "09:14:02  activity · board/play · capable · low" },
    ],
    composer: { kind: "field", prompt: "turn", value: "", placeholder: "say it, or / for a command", keys: "+ attach  ◉ dictate  ⏎" },
    split: { align: "right", share: 55, dragging: false },
    meters: [0.12, 0.34, 0.71, 0.92],
    dots: ["positive", "primary", "caution", "negative", "paused", "off"],
    mark: { fault: false },
  };
  fn(world);
  return world;
};

const running = (world) => {
  world.name = "running";
  world.activity = { signal: "primary", text: "running · r3/10", tool: "match_move" };
  world.harness = { ...world.harness, rounds: 3 };
  world.tabs[0].signal = "primary";
  world.journal = [
    { register: "you", who: "beef", meta: "09:15", text: "play e4 and tell me why" },
    {
      register: "agent",
      meta: "streaming",
      text: "Reading the position.",
      calls: [
        { name: "match_board", arg: "{}", status: "ok", duration: "0.4s" },
        { name: "match_move", arg: '{ "uci": "e2e4" }', status: "run" },
      ],
    },
  ];
  world.composer = { kind: "field", prompt: "turn", value: "and if black plays c5?", placeholder: "", keys: "■ stop" };
};

const consent = (world) => {
  running(world);
  world.name = "consent";
  world.activity = { signal: "caution", text: "approve match_move", tool: "match_move" };
  world.tabs[0].signal = "caution";
  world.journal[1].calls[1].status = "wait";
  world.composer = { kind: "consent", name: "match_move", argument: "e2e4" };
};

const paused = (world) => {
  running(world);
  world.name = "paused";
  world.activity = { signal: "paused", text: "paused · r3/10", tool: null };
  world.composer = { kind: "field", prompt: "line", value: "/tune fa", placeholder: "", keys: "tab completes · enter runs" };
  world.chord = true;
  world.hint = "ctrl-v h …";
  world.open = "harness";
};

const faulted = (world) => {
  world.name = "faulted";
  world.activity = { signal: "negative", text: "fault · r3", tool: "fs_write" };
  world.tabs[0].signal = "negative";
  world.mark = { fault: true };
  world.harness = { ...world.harness, context: 0.92 };
  world.journal = [...world.journal, { register: "fault", text: "provider timeout · r3 · fs_write" }];
  world.split = { align: "bottom", share: 30, dragging: true };
};

export const WORLDS = [sample(() => {}), sample(running), sample(consent), sample(paused), sample(faulted)];
