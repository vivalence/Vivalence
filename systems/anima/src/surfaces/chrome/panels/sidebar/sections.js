import { is, mime, v } from "@vivalence/typology";
import { belt } from "@vivalence/ghost";

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

export const harness = (thread) => ({ tune: UNCLAIMED, effort: UNCLAIMED, rounds: v.primitives.hallucination.Policy.dialogue.properties.rounds.default, context: 0, ...(thread !== null && thread.traits.includes("INTELLIGENT") ? thread.trait.INTELLIGENT : {}) });

export const standing = (lighthouse) => (lighthouse.isAuthorized ? "VERIFIED" : lighthouse.status.code);

export const LENSES = { chat: "repl", repl: "trace", trace: "chat" };

export const TUNES = ["frugal", "fast", "balanced", "capable", "unleashed", "eager"];
export const EFFORTS = ["none", "low", "medium", "high"];
export const VIEWS = ["docked", "full", "closed", "messenger"];
export const ALIGNS = [
  ["left", "←"],
  ["right", "→"],
  ["top", "↑"],
  ["bottom", "↓"],
];
export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];
export const GROUPS = ["terminals", "threads", "modes", "buffers", "activity", "harness", "display", "box", "system", "control"];
export const KEYS = { entity: "e", activity: "a", harness: "h", display: "d", box: "x", system: "s", control: "c" };
export const TONES = { primary: "pri", caution: "cau", idle: "" };
export const TRAITED = { thread: [], mode: ["VIEWABLE"] };
export const CAP = 6;
export const STEP = 24;
export const SHARE = { floor: 0.2, ceiling: 0.8, step: 0.05 };

const sub = (text, count) => ({ type: "sub", label: text, count: String(count) });
const keys = (list) => ({ type: "keys", keys: list.map((entry) => ({ on: false, off: false, tone: "", title: entry.signal, ...entry })) });
const choice = (text, values, current, nature) => ({ type: "choice", label: text, chips: values.map((value) => ({ label: value, signal: `${nature} ${value}`, cur: String(current) === value })) });
const value = (text, held, dot) => ({ type: "value", label: text, value: held, dot });
const meter = (text, pct, said, tone) => ({ type: "meter", label: text, pct: Math.max(0, Math.min(100, pct)), text: said, tone });
const stepper = (text, held, dec, inc) => ({ type: "stepper", label: text, value: String(held), dec, inc });
const check = (text, on, signal, held) => ({ type: "check", label: text, on, signal, value: held });
const item = (fields) => ({ type: "item", mark: "", sub: "", dot: "", cur: false, title: fields.signal, ...fields });

const status = (activity) => activity.status;
const owned = (activities, thread) => activities.filter((activity) => thread !== null && activity.thread === thread);
const dotOf = (activities) => loudness(activities).dot;
const percent = (share) => Math.round(share * 100);
const shared = (share) => Math.max(SHARE.floor, Math.min(SHARE.ceiling, share)).toFixed(2);

const listed = (world, kind, all, make, moded) => {
  const typed = kind in world.sections.filter ? world.sections.filter[kind].toLowerCase() : "";
  const hostsOff = world.sections.hostsOff[kind];
  const traited = world.sections.traits[kind];
  const made = all.map((held) => ({ held, row: make(held) }));
  const hosted = made
    .filter(({ held }) => !hostsOff.includes(moded(held).host.reference.absolute))
    .filter(({ held }) => traited.every((trait) => moded(held).implements(trait)));
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
      sub: held.host.reference.absolute,
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
    keys([{ label: "delete", signal: "/buffer/delete", tone: "neg", off: world.terminal.buffer === null }]),
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
  const rounds = harness(world.thread).rounds;
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
          ...elsewhere.map((held) => item({ label: held.word, sub: `${held.mode.host.reference.absolute} · ${loudness(owned(world.activities, held)).text}`, signal: `/thread ${held.id}`, dot: dotOf(owned(world.activities, held)), mark: "▸" })),
        ]),
  ];
};

const intelligent = (world) => {
  const held = harness(world.thread);
  return [
    choice("tune", TUNES, held.tune, "/tune"),
    choice("effort", EFFORTS, held.effort, "/effort"),
    stepper("rounds", held.rounds, `/rounds ${held.rounds - 1}`, `/rounds ${held.rounds + 1}`),
    meter("context", held.context, `${held.context} %`, held.context >= 85 ? "cau" : ""),
    value("tools", UNCLAIMED, ""),
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
});

const display = (world) => [
  dset(world.terminal.dock),
  choice("lens", Object.keys(LENSES), world.terminal.dock.lens, "/dock/lens"),
  choice("markdown", belt.dock.MARKDOWNS, world.terminal.dock.markdown, "/set terminal.dock.markdown"),
  ...(world.narrow ? [] : [stepper("sidebar", world.width, `/sidebar/width ${world.width - STEP}`, `/sidebar/width ${world.width + STEP}`)]),
];

const box = (world) => [
  keys([
    { label: "mic on", signal: "/mic on" },
    { label: "mute", signal: "/mic mute", off: true },
    { label: "tone", signal: "/speaker tone" },
  ]),
  check("voice", false, "/voice on", "off"),
  choice("theme", THEMES, world.app.theme, "/theme"),
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

const control = () => [
  keys([
    { label: "attach…", fn: "attach", arg: "", title: "attach" },
    { label: "dictate", signal: "/dictate" },
    { label: "paste", signal: "/paste" },
    { label: "repl <<", fn: "palette", arg: "/", title: "the palette" },
  ]),
];

const meta = (world) => {
  const seated = owned(world.activities, world.thread);
  const held = harness(world.thread);
  const dock = world.terminal.dock;
  return {
    entity: [world.thread === null ? UNCLAIMED : `${world.thread.word} ‹${reference(world.thread.mode)}›`, ""],
    activity: [loudness(seated).text, lookup(TONES, loudness(seated).tone, "tone")],
    harness: [`${held.tune} · ${held.effort}`, ""],
    display: [`${dock.view}${dock.view === "docked" ? ` · ${dock.align} · ${percent(dock.share)} %` : dock.view === "messenger" ? ` · ${dock.align}` : ""}`, ""],
    box: ["mic off", ""],
    system: [world.runtime.reference.absolute.split("/")[2], ""],
    control: ["", ""],
  };
};

export const sections = (world) => {
  const metas = meta(world);
  return [
    ["entity", "entity", entity(world)],
    ["activity", "activity", activity(world)],
    ["harness", "harness", intelligent(world)],
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
  hosts: [app.client.runtime.reference.absolute, ...app.client.runtime.entities.daemon.$entities.get().map((daemon) => daemon.reference.absolute)],
  narrow: app.bridge.viewport.narrow,
  telemetry: app.telemetry.state.open,
  width: app.bridge.sidebar.width,
});
