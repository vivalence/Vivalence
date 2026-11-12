import { belt as typology, is, mime, Signal, steer, v, Vector } from "@vivalence/typology";
import { belt } from "@vivalence/ghost";

export const resolves = (commands, signal) => {
  const node = steer.trie.at(commands, new Signal(signal).absolute);
  return node !== null && node.effect !== null;
};

export const CONTROLS = [
  [() => true, "a", "attach", "", "/attach"],
  [(commands, dictation) => dictation === null && resolves(commands, "/dictate"), "d", "dictate", "", "/dictate"],
  [(commands, dictation) => dictation !== null, "d", "stop dictation", "live", "/dictate/stop"],
  [(commands, dictation, call) => call === null && resolves(commands, "/call"), "l", "call", "", "/call"],
  [(commands, dictation, call) => call !== null, "l", "end the call", "live", "/call/end"],
  [() => true, "p", "paste", "", "/paste"],
];

export const controlled = (commands, dictation, call) =>
  CONTROLS.filter(([test]) => test(commands, dictation, call));

export const elapsed = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export const playback = (playing) => (playing ? 100 : 0);

const MICROPHONE = [
  [(claimed) => !claimed, { word: "off", tone: "" }],
  [(claimed, paused) => paused, { word: "muted", tone: "cau" }],
  [() => true, { word: "live", tone: "neg" }],
];

export const miked = (claimed, paused) => MICROPHONE.find(([test]) => test(claimed, paused))[1];

const SPEAKER = [
  [(claimed) => !claimed, "off"],
  [(claimed, playing) => playing, "playing"],
  [() => true, "idle"],
];

const sounded = (claimed, playing) => SPEAKER.find(([test]) => test(claimed, playing))[1];

export const PERMISSIONS = { granted: "pos", prompt: "cau", denied: "neg" };

export const voiced = (app) => [
  app.bridge.$call,
  app.bridge.$dictation,
  app.box.device.microphone.$claimed,
  app.box.device.microphone.$paused,
  app.box.device.microphone.$level,
  app.box.device.microphone.$permission,
  app.box.device.speaker.$claimed,
  app.box.device.speaker.$playing,
];

export const lookup = (table, name, kind) => {
  if (!Object.hasOwn(table, name)) throw new Error(`[anima] not a ${kind}: ${JSON.stringify(name)} · ${Object.keys(table).join(" · ")}`);
  return table[name];
};

export const reference = (mode) => (is.object(mode) ? `${mode.type}/${mode.slug}` : String(mode));

export const named = (buffer) => buffer.trait.LABELED.name;

export const short = (type) => type.replace(`${mime.VENDOR}.`, "").split("/").at(-1).replace(/\+.*$/, "");

export const LOUDNESS = {
  RUNNING: { tone: "primary", text: "running", tab: "primary", dot: "pri live" },
  STOPPING: { tone: "caution", text: "stopping", tab: "caution", dot: "cau" },
  PAUSED: { tone: "caution", text: "paused", tab: "caution", dot: "cau breathe" },
  IDLE: { tone: "idle", text: "idle", tab: "none", dot: "" },
  NONE: { tone: "idle", text: "idle", tab: "none", dot: "" },
};

export const loudness = (activities) => lookup(LOUDNESS, belt.activity.loudest(activities), "loudness");

export const tool = (activities) => {
  const running = activities.find((activity) => activity.status === "RUNNING");
  if (running === undefined || running.steps.length === 0) return null;
  return running.steps.at(-1).path.at(-1);
};

export const UNCLAIMED = "—";

const UNMINDED = {
  tier: UNCLAIMED,
  effort: UNCLAIMED,
  rounds: v.primitives.hallucination.Policy.dialogue.properties.rounds.default,
  model: undefined,
  models: [],
  tiers: {},
};

export const harness = (runtime, thread) => {
  if (thread === null || !thread.traits.includes("HARNESSED")) return UNMINDED;
  const { cortex, status } = thread.mode === null || thread.mode.daemon === null ? runtime : thread.mode.daemon;
  if (status.code !== "HEALTHY") return UNMINDED;
  const { provider, id, tier, tune } = thread.trait.HARNESSED;
  const model = cortex.findOne({ type: "dialogue", via: "stream", provider, id, tier, tune });
  const nearest = [tier, ...TIERS].find(
    (named) => cortex.findOne({ type: "dialogue", via: "stream", tier: named }) === model,
  );
  return {
    ...UNMINDED,
    ...thread.trait.HARNESSED,
    tier: nearest === undefined ? UNCLAIMED : nearest,
    model,
    models: cortex.find({ type: "dialogue", via: "stream" }),
    tiers: cortex.tiers,
  };
};

export const RINGS = 30;

const reported = (turn) => turn.meta !== null && turn.meta.usage !== undefined;

const SCALES = [
  [1e6, "M"],
  [1e3, "k"],
];

export const scaled = (count) => {
  const scale = SCALES.find(([floor]) => count >= floor);
  return scale === undefined ? String(count) : `${(count / scale[0]).toFixed(1)}${scale[1]}`;
};

export const contexted = (turns, model) => {
  const last = turns.filter(reported).at(-1);
  const usage = last === undefined ? { input: 0, output: 0 } : last.meta.usage;
  const used = usage.input + usage.output;
  const limit = model === undefined ? null : model.context;
  return { ...usage, used, limit, pct: limit === null ? 0 : Math.round((used / limit) * 100) };
};

const grown = (entries) => entries.reduce((vector, entry) => vector.open(entry.reference, entry), new Vector());

export const labeled = (reference) => {
  const natures = typology.reference.natures(reference);
  return natures.length === MODE ? `${natures[3]}/${natures[4]}` : natures.at(-1);
};

const DECIDED = [
  [(entry) => entry.key === entry.reference, (entry) => `its own key ${belt.harness.MARKS[entry.state]}`],
  [(entry) => entry.key !== null, (entry) => `carried with ${labeled(entry.key)}`],
  [(entry) => entry.state !== "none", () => "mode default"],
  [() => true, () => "—"],
];

export const decided = (entry) => DECIDED.find(([test]) => test(entry))[1](entry);

export const WORDS = { eager: "loaded", lazy: "listed", none: "not in the thread" };

export const MODE = 5;

export const VIEWS_SHOWN = { primer: "all", tools: "loaded" };

export const holder = (reference) => new Signal(typology.reference.natures(reference).slice(0, MODE)).pathname;

export const ownerOf = (reference) =>
  new Signal(typology.reference.natures(reference).slice(0, 2)).pathname;

export const hostWord = (reference) => {
  const [kind, slug] = typology.reference.natures(reference);
  return kind === "runtime" ? "runtime" : slug;
};

export const relative = (reference, base) => typology.reference.natures(reference).slice(typology.reference.natures(base).length).join("/");

export const under = (entries, reference) => entries.filter((entry) => typology.reference.within(entry.reference, reference));

export const tallied = (entries) => {
  const counts = typology.reference.tally(entries);
  return ["eager", "lazy"]
    .filter((state) => counts[state] > 0)
    .map((state) => `${counts[state]}${belt.harness.MARKS[state]}`)
    .join(" ");
};

export const branched = (delta, reference) => ({
  reference,
  state: Object.hasOwn(delta, reference) ? delta[reference] : "none",
});

const SET = [
  ["load", "●", "eager", "pos"],
  ["preload", "○", "lazy", "cau"],
  ["unload", "×", "none", "neg"],
];

const membered = (entries) =>
  Map.groupBy(
    entries.flatMap((entry) => {
      const natures = typology.reference.natures(entry.reference);
      return natures.map((nature, depth) => [
        new Signal(natures.slice(0, depth + 1)).pathname,
        entry,
      ]);
    }),
    ([at]) => at,
  );

const beneath = (tree, reference) =>
  tree.members.has(reference) ? tree.members.get(reference).map(([, entry]) => entry) : [];

const glyph = (state) => (state === "none" ? "" : belt.harness.MARKS[state]);

const paired = (entries) => {
  const counts = typology.reference.tally(entries);
  return ["eager", "lazy"]
    .filter((state) => counts[state] > 0)
    .map((state) => ({ mark: belt.harness.MARKS[state], mk: state, count: counts[state] }));
};

const ACTED = [
  [
    (held) => held.offered,
    (held) => ({ title: `${held.act} ${held.label}`, signal: `/${held.nature}/${held.act} ${held.reference}` }),
  ],
  [
    (held) => held.on && held.keyed,
    (held) => ({ title: `reset ${held.label}`, signal: `/${held.nature}/reset ${held.reference}` }),
  ],
  [() => true, (held) => ({ title: `${held.act} ${held.label}`, fn: "none" })],
];

const set = (entry, nature, label, live, keyed) => {
  const offered = belt.harness.acts(entry, live);
  const pressed = (state) => entry.state === state && (state !== "none" || keyed);
  return SET.filter(([act, , state]) => act !== "unload" || offered.includes(act) || pressed(state)).map(
    ([act, mark, state, tone]) => {
      const held = {
        act,
        label,
        nature,
        reference: entry.reference,
        keyed,
        offered: offered.includes(act),
        on: pressed(state),
      };
      return {
        mark,
        tone,
        on: held.on,
        off: !held.offered && !held.on,
        ...ACTED.find(([test]) => test(held))[1](held),
      };
    },
  );
};

const CARRIED = [
  [(entry) => entry.key === entry.reference, " keyed"],
  [(entry) => entry.key !== null, " carried"],
  [() => true, ""],
];

const keyed = (entry) => CARRIED.find(([test]) => test(entry))[1];

const carrying = (tree, reference, depth, rail) =>
  Object.hasOwn(tree.delta, reference) ? depth : rail;

const leafy = (world, tree, key, label, entry, depth, rail) => ({
  depth,
  rail,
  label,
  lc: entry.state === "none" ? "light" : "ink",
  mark: glyph(entry.state),
  mk: `${entry.state}${keyed(entry)}`,
  tally: [],
  set: set(entry, tree.nature, label, entry.state !== "none", entry.key === entry.reference),
  fold: null,
  cur: world.sections.current === key,
});

const peeked = (world, tree, key, label, entry, depth, rail) => [
  item({
    ...leafy(world, tree, key, label, entry, depth, rail),
    fn: "peek",
    arg: { key, name: entry.name },
  }),
  ...(key in world.sections.expand
    ? [note(world.sections.peeks[key] ?? "…"), value("decided by", decided(entry), "")]
    : []),
];

const armed = (world, tree, key, label, entry, depth, rail) => [
  item({ ...leafy(world, tree, key, label, entry, depth, rail), fn: "pick", arg: key }),
  ...(key in world.sections.expand
    ? [
        note(entry.valence ?? ""),
        value("reference", entry.reference, ""),
        value("decided by", decided(entry), ""),
      ]
    : []),
];

const disclosure = (world, key, held) => ({
  type: "value",
  label: key,
  value: held,
  dot: "",
  fn: "expand",
  arg: key,
  open: key in world.sections.expand,
});

const folder = (world, tree, reference, label, sub, depth, rail) => {
  const key = `${tree.root}${reference}`;
  const own = branched(tree.delta, reference);
  const live = beneath(tree, reference).some((entry) => entry.state !== "none");
  const open = key in world.sections.expand;
  return item({
    depth,
    rail,
    label,
    lc: "strong",
    sub,
    mark: glyph(own.state),
    mk: `${own.state}${Object.hasOwn(tree.delta, reference) ? " keyed" : ""}`,
    tally: open ? [] : paired(beneath(tree, reference)),
    set: set(own, tree.nature, label, live, Object.hasOwn(tree.delta, reference)),
    fold: { mark: open ? "▾" : "▸", fn: "expand", arg: key },
    cur: world.sections.current === key,
    fn: "pick",
    arg: key,
  });
};

const shown = (tree, reference) =>
  tree.view === "all" ||
  beneath(tree, reference).some((entry) => entry.state !== "none") ||
  Object.keys(tree.delta).some((key) => typology.reference.within(key, reference));

const folded = (world, tree, vector, reference, depth, rail) =>
  [...vector.trie].flatMap(([pattern, child]) => {
    const at = `${reference}/${pattern.nature}`;
    if (!shown(tree, at)) return [];
    const key = `${tree.root}${at}`;
    const label = relative(at, reference);
    if (child.trie.size === 0) return tree.leaf(world, tree, key, label, child.effect, depth, rail);
    return [
      folder(world, tree, at, label, "", depth, rail),
      ...(key in world.sections.expand
        ? folded(world, tree, child, at, depth + 1, carrying(tree, at, depth, rail))
        : []),
    ];
  });

const owning = (world, tree, at, rail) =>
  typology.array
    .unique(beneath(tree, at).map((entry) => holder(entry.reference)))
    .filter((mode) => shown(tree, mode))
    .flatMap((mode) => {
      const natures = typology.reference.natures(mode);
      const home = mode === tree.home ? "home" : "";
      return [
        folder(world, tree, mode, `${natures[3]}/${natures[4]}`, home, 1, rail),
        ...(`${tree.root}${mode}` in world.sections.expand
          ? folded(
              world,
              tree,
              steer.trie.at(tree.grown, natures),
              mode,
              2,
              carrying(tree, mode, 1, rail),
            )
          : []),
      ];
    });

const rooted = (world, tree) =>
  typology.array
    .unique(tree.entries.map((entry) => ownerOf(entry.reference)))
    .filter((at) => shown(tree, at))
    .flatMap((at) => [
      folder(world, tree, at, at, "", 0, -1),
      ...(`${tree.root}${at}` in world.sections.expand ? owning(world, tree, at, carrying(tree, at, 0, -1)) : []),
    ]);

const SAID = [
  [({ references }) => references.length === 0, () => ({ said: "", fault: false })],
  [({ changes }) => changes.length > 0, () => ({ said: "", fault: false })],
  [({ options }) => options.length === 0, ({ filter }) => ({ said: `matches nothing: ${filter}`, fault: true })],
  [() => true, () => ({ said: "already so", fault: false })],
];

export const previewing = (thread, nature, references, filter, options) => {
  const changes = belt.harness.previewed(thread, nature, references);
  const held = { nature, references, changes, options, filter };
  return {
    ...SAID.find(([test]) => test(held))[1](held),
    count: changes.length,
    head: `would change ${changes.length}`,
    rows: typology.array.unique(changes.map((change) => holder(change.reference))).flatMap((mode) => {
      const natures = typology.reference.natures(mode);
      return [
        { head: true, reference: mode, mark: "", label: `${natures[3]}/${natures[4]}`, sub: hostWord(mode) },
        ...changes
          .filter((change) => typology.reference.within(change.reference, mode))
          .map((change) => ({
            head: false,
            reference: change.reference,
            mark: belt.harness.MARKS[change.after],
            label: relative(change.reference, mode),
            sub: `${belt.harness.MARKS[change.before]} → ${belt.harness.MARKS[change.after]}`,
          })),
      ];
    }),
  };
};

const viewed = (world, root) => (root in world.sections.views ? world.sections.views[root] : VIEWS_SHOWN[root]);

const strip = (tree, open) => ({
  type: "sub",
  label: tree.root,
  count: "",
  tally: paired(tree.entries),
  chips: open
    ? ["loaded", "all"].map((view) => ({
        label: view,
        signal: `/harness/view ${tree.root} ${view}`,
        cur: tree.view === view,
      }))
    : [],
  fn: "expand",
  arg: tree.root,
  open,
});

const treed = (world, map, trait, root, nature, leaf) => {
  const tree = {
    root,
    nature,
    leaf,
    view: viewed(world, root),
    entries: map[trait],
    home: map.home,
    delta: world.thread.trait[trait],
    grown: grown(map[trait]),
    members: membered(map[trait]),
  };
  const open = root in world.sections.expand;
  const rows = open ? rooted(world, tree) : [];
  return [
    strip(tree, open),
    ...rows,
    ...(open && rows.length === 0 && tree.view === "loaded"
      ? [{ type: "more", label: "nothing loaded · all", signal: `/harness/view ${root} all` }]
      : []),
  ];
};

export const standing = (lighthouse) => (lighthouse.isAuthorized ? "VERIFIED" : lighthouse.status.code);

export const TIERS = ["frugal", "fast", "balanced", "capable", "unleashed"];
export const VIEWS = ["docked", "full", "closed", "messenger"];
export const ALIGNS = [
  ["left", "←"],
  ["right", "→"],
  ["top", "↑"],
  ["bottom", "↓"],
];
export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];
export const FONTS = ["2xs", "xs", "sm", "base", "lg", "xl", "2xl"];
export const GROUPS = ["terminals", "threads", "modes", "buffers", "activity", "harness", "display", "box", "system", "control"];
export const KEYS = { entity: "e", activity: "a", harness: "h", display: "d", box: "x", system: "s", control: "c" };
export const TONES = { primary: "pri", caution: "cau", idle: "" };
export const TRAITED = { thread: [], mode: ["VIEWABLE"] };
export const CAP = 6;
export const STEP = 24;
export const SHARE = { floor: 0.2, ceiling: 0.8, step: 0.05 };
const BUDGET = v.thread.traits.properties.HARNESSED.properties.rounds;
export const ROUNDS = { min: BUDGET.minimum, max: BUDGET.maximum, step: 1 };

const sub = (text, count) => ({ type: "sub", label: text, count: String(count) });
const keys = (list) => ({ type: "keys", keys: list.map((entry) => ({ on: false, off: false, tone: "", title: entry.signal, ...entry })) });
const choice = (text, values, current, nature) => ({ type: "choice", label: text, chips: values.map((value) => ({ label: value, signal: `${nature} ${value}`, cur: String(current) === value })) });
const toggles = (text, options, on, signal) => ({ type: "toggles", label: text, options, on, signal });
const value = (text, held, dot) => ({ type: "value", label: text, value: held, dot });
const meter = (text, pct, said, tone) => ({ type: "meter", label: text, pct: Math.max(0, Math.min(100, pct)), text: said, tone });
const stepper = (text, held, dec, inc, coarse = { dec, inc }) => ({
  type: "stepper",
  label: text,
  value: String(held),
  dec,
  inc,
  coarse,
});
const budgeted = (rounds) => `/rounds ${Math.max(ROUNDS.min, Math.min(ROUNDS.max, rounds))}`;
const note = (text) => ({ type: "note", text });
const item = (fields) => ({ type: "item", mark: "", mk: "", sub: "", dot: "", cur: false, title: fields.signal, ...fields });

const status = (activity) => activity.status;
const owned = (activities, thread) => activities.filter((activity) => thread !== null && activity.thread === thread);
const dotOf = (activities) => loudness(activities).dot;
export const percent = (share) => Math.round(share * 100);
const shared = (share) => Math.max(SHARE.floor, Math.min(SHARE.ceiling, share)).toFixed(2);

const listed = (world, kind, all, make, moded) => {
  const typed = kind in world.sections.filter ? world.sections.filter[kind].toLowerCase() : "";
  const hostsOff = world.sections.hostsOff[kind];
  const traited = world.sections.traits[kind];
  const made = all.map((held) => ({ held, row: make(held) }));
  const hosted = made
    .filter(({ held }) => !hostsOff.includes(
      (moded(held) === null || moded(held).daemon === null ? world.runtime : moded(held).daemon)
        .reference.absolute,
    ))
    .filter(({ held }) => traited.every((trait) => moded(held) !== null && moded(held).implements(trait)));
  const kept = hosted.filter(({ row }) => typed === "" || row.label.toLowerCase().includes(typed) || row.sub.toLowerCase().includes(typed));
  const big = all.length > CAP;
  const open = kind in world.sections.expand || !big || typed !== "";
  const shown = open ? kept : kept.slice(0, CAP);
  const dim = hostsOff.length > 0 || traited.length > 0;
  return [
    ...(big ? [{ type: "filter", kind, ph: `filter ${kind}s`, q: typed, count: typed !== "" || dim ? `${kept.length} / ${all.length}` : String(all.length), pick: world.sections.pick === kind, dim }] : []),
    ...(big && world.sections.pick === kind ? [{ type: "tags", kind, tags: [
      ...world.hosts.map((host) => ({ label: host, on: !hostsOff.includes(host), signal: `/filter/daemon ${kind} ${host}` })),
      ...TRAITED[kind].map((trait) => ({ label: trait.toLowerCase(), on: traited.includes(trait), signal: `/filter/trait ${kind} ${trait}` })),
    ] }] : []),
    ...shown.map(({ row }) => item(row)),
    ...(kept.length === 0 ? [{ type: "more", label: "no match", fn: "none", arg: kind }] : []),
    ...(big && typed === "" && kept.length > CAP ? [{ type: "more", label: open ? "fewer" : `${kept.length - shown.length} more`, fn: "expand", arg: kind }] : []),
  ];
};

const selected = (selector) => {
  const keyed = [selector.provider, selector.id, selector.tier].filter(is.string);
  return keyed.length === 0 ? "default" : keyed.join(" · ");
};

const heard = (world, signal) => resolves(world.terminal.repl.commands, signal);

const ENGAGED = ["on", "off"];

const VOICE = ["dictate", "call"];

const EARLESS = "no hallucinator hears · hear, call, polish stay absent";

const faculty = (world, name) => value(name, selected(world.thread.trait.CONVERSATIONAL[name]), "");

const voices = (world) => VOICE.filter((word) => heard(world, `/${word}`));

const engaged = (world) =>
  choice(
    "engaged",
    ENGAGED,
    world.thread.trait.CONVERSATIONAL.polish.engaged ? "on" : "off",
    "/polish/engaged",
  );

const conversational = (world) => [
  ...(heard(world, "/dictate") ? [faculty(world, "hear")] : []),
  faculty(world, "speak"),
  ...(heard(world, "/call") ? [faculty(world, "call")] : []),
  ...(heard(world, "/polish/engaged") ? [faculty(world, "polish"), engaged(world)] : []),
  ...(voices(world).length > 0
    ? [value("mode voice", voices(world).join(" · "), "")]
    : [note(EARLESS)]),
];

const conversing = (world) =>
  world.thread !== null && world.thread.traits.includes("CONVERSATIONAL")
    ? [
        {
          ...sub("conversational", ""),
          tally: [],
          chips: [],
          fn: "expand",
          arg: "conversational",
          open: "conversational" in world.sections.expand,
        },
        ...("conversational" in world.sections.expand ? conversational(world) : []),
      ]
    : [];

const grouped = (rows) => {
  let group = "terminals";
  return rows.map((row) => {
    if (row.type === "sub") group = row.label;
    return { ...row, group };
  });
};

const entity = (world) =>
  grouped([
    sub("terminals", world.terminals.length),
    ...world.terminals.map((held) =>
      item({
        label: `${held.index}  ${held.thread === null ? UNCLAIMED : held.thread.word}`,
        sub: held.thread === null ? "" : reference(held.thread.mode),
        signal: `/terminal ${held.index}`,
        cur: held === world.terminal,
        dot: held.thread === null ? "" : dotOf(owned(world.activities, held.thread)),
        mark: "[◇]",
      }),
    ),
    keys([
      { label: "new terminal", signal: "/terminal/new" },
      { label: "close", signal: "/terminal/close", off: world.terminals.length < 2 },
    ]),
    sub("threads", world.threads.length),
    ...listed(world, "thread", world.threads, (held) => ({ label: held.word, sub: reference(held.mode), signal: `/thread ${held.id}`, cur: held === world.thread, dot: dotOf(owned(world.activities, held)), mark: "─◇─" }), (held) => held.mode),
    keys([
      { label: "new thread", signal: "/thread/new" },
      { label: "label…", fn: "palette", arg: "/thread/label ", title: "/thread/label" },
      { label: "delete", signal: "/thread/delete", tone: "neg", off: world.thread === null },
    ]),
    sub("modes", world.modes.length),
    ...listed(world, "mode", world.modes, (held) => ({
      label: reference(held),
      sub: (held.daemon === null ? world.runtime : held.daemon).reference.absolute,
      signal: `/mode ${held.reference.absolute}`,
      cur: world.thread !== null && held === world.thread.mode,
      mark: world.thread !== null && held === world.thread.mode ? "‹›" : "◇",
    }), (held) => held),
    sub("buffers", world.buffers.length),
    ...(world.buffers.length === 0
      ? [{ type: "more", label: "no buffers", fn: "none", arg: "buffer" }]
      : [
          ...world.buffers.map((buffer) => {
            const framed = world.terminal.buffer === buffer;
            return item({
              label: named(buffer),
              sub: `${short(buffer.mime)} · ${world.thread.word}`,
              signal: framed ? "/buffer/close" : `/buffer "${named(buffer)}"`,
              cur: framed,
              mark: framed ? "▣" : "□",
              title: framed ? "close the frame · /buffer/close" : "into the frame",
            });
          }),
        ]),
    keys([
      { label: "new", signal: "/buffer/new", off: world.thread === null },
      { label: "delete", signal: "/buffer/delete", tone: "neg", off: world.terminal.buffer === null },
    ]),
  ]);

const STATES = [
  [(seated) => seated.some((activity) => status(activity) === "PAUSED"), () => "consent"],
  [(seated) => seated.some((activity) => status(activity) === "RUNNING"), (seated) => (tool(seated) === null ? "running" : `running · ${tool(seated)}`)],
  [(seated) => seated.some((activity) => status(activity) === "STOPPING"), () => "stopping"],
  [() => true, () => "idle"],
];
const stated = (seated) => STATES.find(([test]) => test(seated))[1](seated);

const activity = (world) => {
  const seated = owned(world.activities, world.thread);
  const running = seated.some((held) => status(held) === "RUNNING");
  const paused = seated.some((held) => status(held) === "PAUSED");
  const rounds = harness(world.runtime, world.thread).rounds;
  const elsewhere = world.threads.filter((held) => held !== world.thread && owned(world.activities, held).some((each) => ["RUNNING", "PAUSED", "STOPPING"].includes(status(each))));
  return [
    value(stated(seated), "", seated.length === 0 ? "mut" : dotOf(seated)),
    meter("rounds", 0, `0 / ${rounds}`, paused ? "cau" : ""),
    keys([
      { label: "pause", signal: "/pause", off: !running },
      { label: "resume", signal: "/resume", off: !paused },
      { label: "stop", signal: "/stop", hold: "/abort", off: !(running || paused), tone: "neg", title: "SIGTERM · hold: SIGKILL" },
    ]),
    ...(seated.length === 0
      ? []
      : [
          sub("on this thread", seated.length),
          ...seated.map((held) => item({ label: `/${held.type.toLowerCase()}`, sub: `${status(held).toLowerCase()} · ${held.steps.length} steps`, dot: dotOf([held]), mark: "▸", signal: "/activity" })),
        ]),
    ...(elsewhere.length === 0
      ? []
      : [
          sub("elsewhere", elsewhere.length),
          ...elsewhere.map((held) => item({ label: held.word, sub: `${(held.mode === null || held.mode.daemon === null ? world.runtime : held.mode.daemon).reference.absolute} ·${loudness(owned(world.activities, held)).text}`, signal: `/thread ${held.id}`, dot: dotOf(owned(world.activities, held)), mark: "▸" })),
        ]),
  ];
};

const pointed = (held) => {
  if (Array.isArray(held.tune)) return held.tune;
  return Object.hasOwn(held.tiers, held.tier) ? held.tiers[held.tier] : null;
};

const harnessed = (world) => {
  const held = harness(world.runtime, world.thread);
  const point = pointed(held);
  const map = belt.harness.served(world.thread);
  const reckoned = contexted(world.turns, held.model);
  const ceiling = reckoned.limit === null ? UNCLAIMED : scaled(reckoned.limit);
  return [
    choice("tier", TIERS, held.tier, "/tier"),
    disclosure(world, "model", held.model === undefined ? UNCLAIMED : `${held.model.id} · ${held.model.provider}`),
    ...("model" in world.sections.expand
      ? held.models.map((model) =>
          item({
            label: model.id,
            sub: model.provider,
            mark: model === held.model ? "◉" : "●",
            mk: "glyph",
            cur: model === held.model,
            signal: `/model ${model.provider} ${model.id}`,
          }),
        )
      : []),
    disclosure(world, "tune", point === null ? UNCLAIMED : point.map((share) => share.toFixed(2)).join(" · ")),
    ...("tune" in world.sections.expand && point !== null
      ? [{ type: "tune", axes: v.primitives.hallucination.axes, point, signal: "/tune" }]
      : []),
    choice("effort", belt.harnessed.EFFORTS, held.effort, "/effort"),
    stepper("rounds", held.rounds, budgeted(held.rounds - 1), budgeted(held.rounds + 1), {
      dec: budgeted(held.rounds - 10),
      inc: budgeted(held.rounds + 10),
    }),
    {
      ...meter("context", reckoned.pct, `${reckoned.pct} %`, ""),
      rings: RINGS,
      fn: "expand",
      arg: "context",
      open: "context" in world.sections.expand,
    },
    ...("context" in world.sections.expand
      ? [
          value("used", `${scaled(reckoned.used)} / ${ceiling}`, ""),
          value("last turn", `${scaled(reckoned.input)} in · ${scaled(reckoned.output)} out`, ""),
          ...(reckoned.cost === undefined ? [] : [value("cost", `$${reckoned.cost.toFixed(4)}`, "")]),
        ]
      : []),
    ...conversing(world),
    ...(belt.harness.mounted(world.thread)
      ? [
          ...treed(world, map, "PRIMED", "primer", "primer", peeked),
          ...treed(world, map, "TOOLED", "tools", "tool", armed),
        ]
      : []),
  ];
};

export const dset = (dock) => ({
  type: "display",
  view: dock.view,
  align: dock.align,
  share: percent(dock.share),
  views: VIEWS.map((view) => ({ label: view, signal: `/dock ${view}`, cur: dock.view === view })),
  aligns: ALIGNS.map(([align, glyph]) => ({ label: align, glyph, signal: `/dock ${align}`, cur: dock.align === align })),
  less: { signal: `/split ${shared(dock.share - SHARE.step)}` },
  more: { signal: `/split ${shared(dock.share + SHARE.step)}` },
  slide: "/split",
  lens: { options: belt.dock.LENSES, on: dock.lens, signal: "/dock/lens" },
});

const display = (world) => [
  dset(world.terminal.dock),
  toggles("lens", belt.dock.LENSES, world.terminal.dock.lens, "/dock/lens"),
  choice("markdown", belt.dock.MARKDOWNS, world.terminal.dock.markdown, "/set terminal.dock.markdown"),
  ...(world.narrow ? [] : [stepper("sidebar", world.width, `/sidebar/width ${world.width - STEP}`, `/sidebar/width ${world.width + STEP}`)]),
];

const miking = (world) =>
  miked(world.app.box.device.microphone.claimed, world.app.box.device.microphone.paused);

const microphone = (world) =>
  meter(
    "microphone",
    percent(world.app.box.device.microphone.level),
    miking(world).word,
    miking(world).tone,
  );

const muting = (world) =>
  keys([
    { label: "mic on", signal: "/mic on", off: !world.app.box.device.microphone.paused },
    {
      label: "mute",
      signal: "/mic mute",
      off: !world.app.box.device.microphone.claimed || world.app.box.device.microphone.paused,
    },
  ]);

const box = (world) => [
  microphone(world),
  ...(heard(world, "/mic") ? [muting(world)] : []),
  meter(
    "speaker",
    playback(world.app.box.device.speaker.playing),
    sounded(world.app.box.device.speaker.claimed, world.app.box.device.speaker.playing),
    "",
  ),
  value(
    "permission",
    world.app.box.device.microphone.permission,
    lookup(PERMISSIONS, world.app.box.device.microphone.permission, "microphone permission"),
  ),
  choice("theme", THEMES, world.app.theme, "/theme/set"),
  choice("font", FONTS, world.app.bridge.font, "/font/set"),
];

const system = (world) => {
  const verified = standing(world.runtime.lighthouse) === "VERIFIED";
  return [
    sub("runtime", `${world.daemons.length + 1} hosts`),
    value(world.runtime.reference.absolute, world.runtime.status.code.toLowerCase(), world.runtime.status.code === "HEALTHY" ? "pos" : "neg"),
    ...world.daemons.map((daemon) => value(daemon.reference.absolute, `${daemon.modes.length} modes`, daemon.status.code === "HEALTHY" ? "pos" : "neg")),
    value(world.app.client.mask.manifest.slug, "home · console", "pos"),
    value("latency", UNCLAIMED, ""),
    keys([
      { label: "runtime", signal: "/runtime" },
      { label: "lighthouse", signal: "/lighthouse" },
    ]),
    sub("lighthouse", ""),
    value(verified ? world.runtime.lighthouse.user.slug : "signed out", verified ? "verified" : "", verified ? "pos" : "cau"),
    value("session", UNCLAIMED, ""),
    keys(verified ? [{ label: "refresh", signal: "/lighthouse/refresh" }, { label: "sign out", signal: "/lighthouse/logout", tone: "neg" }] : [{ label: "sign in", signal: "/lighthouse/login", on: true }]),
    sub("client", ""),
    keys([
      { label: "telemetry", signal: "/telemetry", on: world.telemetry },
      { label: "keymap", signal: "/keymap" },
      { label: "help", signal: "/help" },
    ]),
  ];
};

const offered = (world) =>
  controlled(world.terminal.repl.commands, world.app.bridge.dictation, world.app.bridge.call)
    .filter(([, key]) => key !== "a");

const control = (world) => [
  keys([
    { label: "attach…", fn: "attach", arg: "", title: "attach" },
    ...offered(world).map(([, , label, live, signal]) => ({ label, signal, on: live !== "" })),
    { label: "repl <<", fn: "palette", arg: "/", title: "the palette" },
  ]),
];

const meta = (world) => {
  const seated = owned(world.activities, world.thread);
  const held = harness(world.runtime, world.thread);
  const dock = world.terminal.dock;
  return {
    entity: [world.thread === null ? UNCLAIMED : `${world.thread.word} ‹${reference(world.thread.mode)}›`, ""],
    activity: [loudness(seated).text, lookup(TONES, loudness(seated).tone, "tone")],
    harness: [`${held.tier} · ${held.effort}`, ""],
    display: [`${dock.view}${dock.view === "docked" ? ` · ${dock.align} · ${percent(dock.share)} %` : dock.view === "messenger" ? ` · ${dock.align}` : ""}`, ""],
    box: [`mic ${miking(world).word}`, ""],
    system: [world.runtime.reference.absolute.split("/")[2], ""],
    control: ["", ""],
  };
};

export const sections = (world) => {
  const metas = meta(world);
  return [
    ["entity", "entity", entity(world)],
    ["activity", "activity", activity(world)],
    ["harness", "harness", harnessed(world)],
    ["display", "display", display(world)],
    ["box", "box", box(world)],
    ["system", "system", system(world)],
    ["control", "control", control(world)],
  ].map(([id, title, rows]) => ({ id, title, meta: metas[id][0], tone: metas[id][1], rows, key: KEYS[id], head: true }));
};

export const sideView = (world) =>
  sections(world)
    .filter((section) => !world.hidden.includes(section.id))
    .map((section) => (section.id !== "entity" ? section : { ...section, rows: section.rows.filter((row) => !world.hidden.includes(row.group)) }))
    .filter((section) => section.rows.length > 0);

export const sideTags = (world) => ({ type: "tags", kind: "sidebar", tags: GROUPS.map((group) => ({ label: group, on: !world.hidden.includes(group), signal: `/sidebar/show ${group}` })) });

export const gathered = (app, terminal) => ({
  app,
  sections: app.bridge.sections,
  hidden: app.bridge.hidden,
  terminal,
  thread: terminal.thread,
  runtime: app.client.runtime,
  terminals: app.client.runtime.entities.terminal.$entities.get(),
  threads: app.client.runtime.entities.thread.$entities.get(),
  modes: app.client.runtime.entities.mode.$entities.get(),
  daemons: app.client.runtime.entities.daemon.$entities.get(),
  activities: app.client.runtime.entities.activity.$entities.get(),
  buffers: terminal.thread === null ? [] : terminal.thread.$buffers.get(),
  turns: terminal.thread === null ? [] : terminal.thread.$turns.get(),
  hosts: [app.client.runtime.reference.absolute, ...app.client.runtime.entities.daemon.$entities.get().map((daemon) => daemon.reference.absolute)],
  narrow: app.bridge.viewport.narrow,
  telemetry: app.telemetry.state.open,
  width: app.bridge.sidebar.width,
});
