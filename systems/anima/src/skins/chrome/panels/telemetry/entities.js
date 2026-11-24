import { belt as typology, fromm, shape, Signal, steer, Vector } from "@vivalence/typology";
import { belt } from "@vivalence/ghost";
import { amount, branched, decided, GROUPS, harness, holder, ownerOf, relative, tallied, THEMES, TIERS, under, WORDS } from "../sidebar/sections.js";

export const LENSES = [
  ["tree", "tree"],
  ["tool", "tools"],
  ["primer", "primers"],
  ["reference", "refs"],
  ["route", "routes"],
  ["command", "commands"],
  ["trait", "traits"],
  ["mode", "modes"],
];

export const OWNERS = { command: ["repl"], mode: ["daemon", "runtime", "registry"] };

const scalar = (value) => value === null || typeof value !== "object";

const SAID = [
  [(value) => value === undefined, () => "undefined"],
  [(value) => scalar(value), (value) => String(value)],
  [(value) => Array.isArray(value) && value.every(scalar), (value) => (value.length ? value.map(String).join(" · ") : "[]")],
  [(value) => Array.isArray(value), (value) => `[${value.length}]`],
  [(value) => value instanceof Date, (value) => value.toISOString()],
  [(value) => Object.keys(value).length === 0, () => "{}"],
  [(value) => Object.values(value).every(scalar), (value) => Object.entries(value).map(([key, held]) => `${key} ${held}`).join(" · ")],
  [() => true, (value) => `{${Object.keys(value).join(" ")}}`],
];
export const said = (value) => SAID.find(([test]) => test(value))[1](value);

const row = (k, value, more = {}) => ({ k, v: said(value), q: "", cls: "", bang: false, go: null, edit: null, ...more });
const link = (k, value, go, more = {}) => row(k, value, { go, ...more });
const edit = (k, value, editor, more = {}) => ({ ...row(k, value, more), edit: { nature: "/set", ...editor, value } });

export const node = (id, name, kind, held = {}, kids = []) => ({
  id,
  name,
  kind,
  title: name,
  ref: "",
  quiet: "",
  sign: "",
  tail: "",
  count: "",
  bang: false,
  acts: [],
  secs: [],
  keys: [],
  all: false,
  ...held,
  kids,
});

const traited = (entity, edits = {}) =>
  Object.entries(entity.trait).flatMap(([name, value]) => {
    const worn = entity.traits.includes(name);
    const head = row(`${worn ? "●" : "○"} ${name}`, value, { cls: worn ? "is-worn" : "is-cast" });
    return Object.hasOwn(edits, name) ? edits[name](head, value) : [head];
  });

const typed = (schema) => {
  if (schema.enum !== undefined) return schema.enum.join(" · ");
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.type === "array" && schema.items !== undefined) return `${typed(schema.items)}[]`;
  if (schema.anyOf !== undefined) return schema.anyOf.map(typed).join(" | ");
  const bounds = [schema.minimum, schema.maximum].filter((bound) => bound !== undefined);
  return `${schema.type === undefined ? "any" : schema.type}${bounds.length === 2 ? ` ${bounds.join("–")}` : ""}`;
};

const about = (schema) => (schema.description === undefined ? "" : schema.description);

const NONE = [row("○ none", "{}", { cls: "is-cast" })];

export const inputs = (schema) => {
  if (schema === undefined || scalar(schema) || schema.properties === undefined) return NONE;
  const required = schema.required === undefined ? [] : schema.required;
  const keys = Object.keys(schema.properties);
  if (keys.length === 0) return NONE;
  return keys.map((key) => row(required.includes(key) ? key : `${key}?`, typed(schema.properties[key]), { q: about(schema.properties[key]) }));
};

const SHAPES = ["input", "output", "yields", "feeds"];
const valence = (effect) => (effect.valence === undefined ? "" : effect.valence);

const LEAVES = {
  tool: (effect, steps, load) => ({
    as: steps.join("_"),
    secs: [
      ["effect", [row("valence", valence(effect)), row("load", load)]],
      ["input", inputs(effect.input)],
      ["address", [row("path", `/${steps.join("/")}`), row("as", steps.join("_"), { q: "the model sees" })]],
    ],
  }),
  primer: (effect, steps, load) => ({
    quiet: load,
    acts: ["read"],
    primer: steps.join("/"),
    secs: [["own", [row("load", load), row("valence", valence(effect))]]],
  }),
  reference: (effect, steps) => ({
    quiet: "faculty",
    secs: [["own", [row("faculty", steps[0]), row("valence", valence(effect))]], ["input", inputs(effect.input)]],
  }),
  route: (effect) => {
    const shapes = [...(effect.methods === undefined ? [] : effect.methods), ...SHAPES.filter((key) => effect[key] !== undefined)];
    return {
      quiet: shapes.join(" "),
      secs: [
        ["effect", [row("valence", valence(effect)), row("shapes", shapes.length ? shapes.join(" ") : "{}")]],
        ["input", inputs(effect.input)],
        ...(effect.output === undefined ? [] : [["output", inputs(effect.output)]]),
      ],
    };
  },
  command: (effect, steps) => {
    const nature = `/${steps.join("/")}`;
    const open = effect.input === undefined || effect.input.required === undefined || effect.input.required.length === 0;
    return {
      quiet: effect.chord === undefined ? (effect.rank === undefined ? "" : effect.rank) : effect.chord,
      name: nature,
      keys: [nature],
      acts: open ? ["send"] : [],
      secs: [
        ["own", [row("nature", nature), row("rank", effect.rank === undefined ? "listed" : effect.rank), row("chord", effect.chord === undefined ? "—" : effect.chord)]],
        ["effect", [row("valence", valence(effect))]],
        ["input", inputs(effect.input)],
      ],
    };
  },
};

const edged = (child) => (child.effect !== undefined ? child.effect : child.meta !== undefined ? child.meta : {});

export const stripped = (prefix, ref, strip, kind, steps = [], carried = "eager") =>
  Object.entries(strip.branches).map(([nature, child]) => {
    const path = [...steps, nature];
    const id = `${prefix}/${path.join("/")}`;
    const load = edged(child).load === undefined ? carried : edged(child).load;
    const kids = stripped(prefix, ref, child, kind, path, load);
    const at = { title: path.join("/"), ref: `${ref}/${path.join("/")}` };
    if (child.effect === undefined) return node(id, nature, "branch", { ...at, quiet: String(count(kids)) }, kids);
    return node(id, nature, kind, { ...at, ...LEAVES[kind](child.effect, path, load) }, kids);
  });

export const count = (nodes) => nodes.reduce((sum, held) => sum + Number(held.kind !== "branch") + count(held.kids), 0);

const grouped = (id, name, kids) => node(id, name, "group", { quiet: String(count(kids)) }, kids);

const CAP = 64;

const leafed = (id, held, entry) => {
  const as = new Signal(entry.name).absolute.join(held.verb === "tool" ? "_" : "/");
  return node(`${id}${entry.reference}`, relative(entry.reference, holder(entry.reference)), held.kind, {
    title: entry.name,
    ref: entry.reference,
    sign: belt.harness.MARKS[entry.state],
    quiet: WORDS[entry.state],
    verb: held.verb,
    primer: entry.name.slice(1),
    acts: [...belt.harness.acts(entry), ...(held.kind === "primer" ? ["read"] : [])],
    secs: [
      [
        "own",
        [
          row("reference", entry.reference),
          row("state", `${belt.harness.MARKS[entry.state]} ${WORDS[entry.state]}`),
          row("decided by", decided(entry)),
          ...(held.verb === "tool" ? [row("model sees", `${as} ${as.length}/${CAP}`, { bang: as.length > CAP })] : []),
        ],
      ],
      ["valence", [row("valence", entry.valence === undefined ? "" : entry.valence)]],
    ],
  });
};

const forked = (id, held, reference, name, quiet, kids) => {
  const own = branched(held.delta, reference);
  const members = under(held.entries, reference);
  return node(
    `${id}${reference}`,
    name,
    "branch",
    {
      title: name,
      ref: reference,
      quiet,
      verb: held.verb,
      acts: belt.harness.acts(own, members.some((entry) => entry.state !== "none")),
      secs: [
        [
          "own",
          [
            row("reference", reference),
            row("state", tallied(members) === "" ? WORDS.none : tallied(members)),
            row("decided by", own.state === "none" ? "—" : `its own key ${belt.harness.MARKS[own.state]}`),
          ],
        ],
        ["members", members.map((entry) => row(`${belt.harness.MARKS[entry.state]} ${relative(entry.reference, reference)}`, WORDS[entry.state]))],
      ],
    },
    kids,
  );
};

const walked = (id, held, vector, reference) =>
  [...vector.trie].map(([pattern, child]) => {
    const at = `${reference}/${pattern.nature}`;
    if (child.trie.size === 0) return leafed(id, held, child.effect);
    return forked(id, held, at, pattern.nature, tallied(under(held.entries, at)), walked(id, held, child, at));
  });

const mapped = (id, thread, map, trait, kind, verb) => {
  const entries = map[trait];
  const held = { kind, verb, entries, delta: thread.trait[trait] };
  const grown = entries.reduce((vector, entry) => vector.open(entry.reference, entry), new Vector());
  const moding = (at) =>
    typology.array
      .unique(under(entries, at).map((entry) => holder(entry.reference)))
      .map((mode) => {
        const natures = typology.reference.natures(mode);
        const quiet = [mode === map.home ? "home" : "", tallied(under(entries, mode))]
          .filter((word) => word !== "")
          .join(" · ");
        const kids = walked(id, held, steer.trie.at(grown, natures), mode);
        return forked(id, held, mode, `${natures[3]}/${natures[4]}`, quiet, kids);
      });
  return typology.array
    .unique(entries.map((entry) => ownerOf(entry.reference)))
    .map((at) => forked(id, held, at, at, tallied(under(entries, at)), moding(at)));
};

export const served = (id, thread) => {
  const map = belt.harness.served(thread);
  return node(id, "map", "group", { quiet: `${map.TOOLED.length + map.PRIMED.length}`, title: `the thread's map · home ${map.home}` }, [
    grouped(`${id}/tools`, "tools", map.home === null ? [] : mapped(`${id}/tools`, thread, map, "TOOLED", "tool", "tool")),
    grouped(`${id}/primer`, "primer", map.home === null ? [] : mapped(`${id}/primer`, thread, map, "PRIMED", "primer", "primer")),
  ]);
};

const harnessed = (id, mode, world) => {
  const ref = `${mode.reference.absolute}/metadata/harness`;
  const tools = stripped(`${id}/tools`, `${ref}/tools`, mode.metadata.harness.tools, "tool");
  const primers = stripped(`${id}/primer`, `${ref}/primer`, mode.metadata.harness.primer, "primer");
  const references = stripped(`${id}/references`, `${ref}/references`, mode.metadata.harness.references, "reference");
  return node(
    id,
    "harness",
    "harness",
    {
      title: `${mode.type}/${mode.slug}`,
      ref,
      quiet: `${count(tools)} tools`,
      secs: [["own", [row("landed with", "HARNESS", { q: "metadata.harness" }), row("counts", { tools: count(tools), primer: count(primers), references: count(references) })]]],
    },
    [
      ...(world.thread !== null && world.thread.mode === mode ? [served(`${id}/map`, world.thread)] : []),
      grouped(`${id}/tools`, "tools", tools),
      grouped(`${id}/primer`, "primer", primers),
      grouped(`${id}/references`, "references", references),
    ],
  );
};

const opened = (id, mode) => {
  const routes = stripped(id, mode.reference.absolute, mode.metadata.aperture, "route");
  return node(id, "aperture", "aperture", { title: `${mode.type}/${mode.slug}`, ref: `${mode.reference.absolute}/metadata/aperture`, quiet: `${count(routes)} routes`, secs: [["own", [row("landed with", "EXPOSED")]]] }, routes);
};

const patterns = (vector) => `${count(stripped("", "", shape.strip(vector), "command"))} patterns`;

const moded = (mode, world) => {
  const id = mode.reference.absolute;
  const seated = world.thread !== null && world.thread.mode === mode;
  const has = (key) => mode.metadata !== null && Object.hasOwn(mode.metadata, key);
  const traits = mode.traits.map((name) =>
    node(`${id}#${name}`, name, "trait", { ref: `${id}#${name}`, secs: [["own", [row("trait", name), link("mode", `${mode.type}/${mode.slug}`, id)]]] }),
  );
  return node(
    id,
    `${mode.type}/${mode.slug}`,
    "mode",
    {
      sign: "◇",
      title: mode.name === null ? mode.slug : mode.name,
      ref: id,
      tail: seated ? "seated" : "",
      keys: [id],
      acts: ["attach"],
      secs: [
        ["own", [row("type", mode.type), row("slug", mode.slug), row("name", mode.name), row("version", mode.version), row("traits", mode.traits), row("metadata", mode.metadata === null ? null : Object.keys(mode.metadata))]],
        ["faces", [row("repl", patterns(mode.repl)), row("keymap", patterns(mode.keymap))]],
        [
          "relations",
          [
            mode.daemon === null ? row("daemon", null, { q: "the runtime's own" }) : link("daemon", mode.daemon.slug, mode.daemon.reference.absolute),
            ...(seated ? [link("thread", `[ ${world.thread.word} ]`, "thread", { q: "seated" })] : []),
          ],
        ],
      ],
    },
    [
      ...(traits.length ? [node(`${id}#traits`, "traits", "traits", { quiet: String(traits.length), title: `${traits.length} worn`, ref: `${id}#traits` }, traits)] : []),
      ...(has("harness") ? [harnessed(`${id}/harness`, mode, world)] : []),
      ...(has("aperture") ? [opened(`${id}/aperture`, mode)] : []),
    ],
  );
};

const STANDING = { HEALTHY: "dot", RUNNING: "dot" };

const hosted = (host, kind, modes, world, held) =>
  node(
    host.reference.absolute,
    kind,
    kind,
    {
      quiet: host.reference.absolute.split("/").at(-1),
      title: host.reference.absolute.split("/").at(-1),
      ref: host.reference.absolute,
      tail: Object.hasOwn(STANDING, host.status.code) ? STANDING[host.status.code] : "",
      bang: host.status.code === "ERROR",
      keys: [host.reference.absolute],
      ...held,
    },
    modes.map((mode) => moded(mode, world)),
  );

const metadata = (host) => [
  "metadata",
  [
    row("manifest", host.metadata.manifest),
    row("statics", host.metadata.statics === null ? null : Object.keys(host.metadata.statics)),
    row("aperture", host.metadata.aperture === null ? null : Object.keys(host.metadata.aperture.branches)),
  ],
];

const KINDS = ["daemon", "mode", "terminal", "thread", "turn", "buffer", "activity"];

const runtimed = (world) => {
  const runtime = world.app.client.runtime;
  const held = hosted(runtime, "runtime", world.modes.filter((mode) => mode.daemon === null), world, {
    id: "runtime",
    secs: [
      ["own", [row("reference", runtime.reference.absolute), row("status", runtime.status.code)]],
      metadata(runtime),
      ["entities", KINDS.map((kind) => row(kind, runtime.entities[kind].$entities.get().length))],
    ],
  });
  const daemons = world.daemons.map((daemon) => {
    const modes = world.modes.filter((mode) => mode.daemon === daemon);
    return hosted(daemon, "daemon", modes, world, {
      secs: [
        ["own", [row("reference", daemon.reference.absolute), row("status", daemon.status.code)]],
        metadata(daemon),
        ["stores", [row("$modes", modes.length)]],
      ],
    });
  });
  return { ...held, kids: [lighthoused(world), ...held.kids, ...daemons] };
};

const lighthoused = (world) => {
  const lighthouse = world.app.client.runtime.lighthouse;
  const user = lighthouse.$user.get();
  return node("lighthouse", "lighthouse", "lighthouse", {
    quiet: user === null ? "—" : user.slug,
    title: user === null ? "lighthouse" : user.slug,
    ref: "/lighthouse",
    tail: lighthouse.isAuthorized ? "dot" : "",
    keys: ["lighthouse"],
    acts: [user === null ? "login" : "logout"],
    secs: [
      ["own", [row("status", lighthouse.$status.get().code), row("isAuthorized", lighthouse.isAuthorized), row("isIdentified", lighthouse.isIdentified)]],
      ["manifest", lighthouse.manifest.traits.map((name) => row(`● ${name}`, "", { cls: "is-worn" }))],
      ["user", user === null ? [row("user", null)] : [row("slug", user.slug), row("id", user.id), ...traited(user)]],
    ],
  });
};

const locals = (world) => {
  const held = fromm.modes(world.app.client.modes).flat;
  return node(
    "locals",
    "local modes",
    "registry",
    { quiet: String(held.length), ref: "client.modes", secs: [["own", [row("source", "register.modes"), row("modes", held.length)]]] },
    held.map((mode) => moded(mode, world)),
  );
};

const clientele = (world) => {
  const client = world.app.client;
  const user = client.runtime.lighthouse.$user.get();
  return node(
    "client",
    "client",
    "client",
    {
      quiet: client.mask.manifest.slug,
      title: client.mask.manifest.slug,
      ref: "client",
      keys: ["client"],
      secs: [
        ["own", [row("type", client.mask.manifest.type), row("slug", client.mask.manifest.slug)]],
        ["mask", [...Object.entries(client.mask.trait).map(([name, value]) => row(`● ${name}`, value, { cls: "is-worn" })), row("modes", client.mask.modes.length)]],
        ["relations", [link("runtime", client.runtime.reference.absolute, "runtime"), link("user", user === null ? null : user.slug, "lighthouse")]],
      ],
    },
    [runtimed(world), locals(world), terminaled(world), repled(world)],
  );
};

const docked = (terminal) => [
  edit("view", terminal.dock.view, { path: "terminal.dock.view", kind: "choice", opts: belt.dock.VIEWS }),
  edit("align", terminal.dock.align, { path: "terminal.dock.align", kind: "choice", opts: belt.dock.SIDES }),
  edit("share", terminal.dock.share, { path: "terminal.dock.share", kind: "step", min: 0.1, max: 0.9, step: 0.05 }),
  edit("lens", terminal.dock.lens, { path: "terminal.dock.lens", kind: "set", opts: belt.dock.LENSES }),
  edit("markdown", terminal.dock.markdown, { path: "terminal.dock.markdown", kind: "choice", opts: belt.dock.MARKDOWNS }),
];

const terminaled = (world) => {
  const terminal = world.terminal;
  const index = world.terminals.indexOf(terminal);
  return node(
    "terminal",
    "terminal",
    "terminal",
    {
      quiet: `${index + 1} of ${world.terminals.length}`,
      title: `${index + 1} of ${world.terminals.length}`,
      ref: terminal.id,
      keys: [`terminal/${terminal.id}`],
      acts: world.terminals.length > 1 ? ["new", "close"] : ["new"],
      secs: [
        ["own", [row("id", terminal.id), row("index", index), row("daemon", terminal.daemon === null ? null : terminal.daemon.slug), row("createdAt", terminal.createdAt)]],
        ["dock", docked(terminal)],
        [
          "relations",
          [
            world.thread === null ? row("thread", null) : link("thread", `[ ${world.thread.word} ]`, "thread"),
            world.seated === null ? row("buffer", null) : link("buffer", world.seated.trait.LABELED.name, `buffer/${world.seated.id}`),
          ],
        ],
      ],
    },
    world.thread === null ? [] : [threaded(world)],
  );
};

const harnessedTrait = (world) => {
  const held = harness(world.app.client.runtime, world.thread);
  return [
    edit("tier", held.tier, { path: "thread.tier", kind: "select", opts: TIERS }),
    edit("effort", held.effort, { path: "thread.effort", kind: "choice", opts: belt.harnessed.EFFORTS }),
    edit("rounds", held.rounds, { path: "thread.rounds", kind: "step", min: 1, max: 100, step: 1 }, { q: "/ 100" }),
  ];
};

const minded = (world) => ({
  HARNESSED: (head) => [head, ...harnessedTrait(world).map((held) => ({ ...held, cls: "is-sub" }))],
  LABELED: (head, value) => [{ ...edit(head.k, "name" in value ? value.name : "", { path: "thread.label", kind: "field" }), cls: head.cls }],
});

const modeled = (mode) =>
  typeof mode === "string" ? row("mode", mode, { q: "host not mounted" }) : mode === null ? row("mode", null) : link("mode", `◇ ${mode.type}/${mode.slug}`, mode.reference.absolute);

const threaded = (world) => {
  const thread = world.thread;
  return node(
    "thread",
    `[ ${thread.word} ]`,
    "thread",
    {
      title: thread.word,
      ref: thread.id,
      keys: [thread.id, `terminal/${world.terminal.id}`],
      secs: [
        ["own", [row("id", thread.id), row("phase", thread.phase), row("counter", thread.counter), row("intent", thread.intent), row("parent", thread.parent), row("createdAt", thread.createdAt), row("updatedAt", thread.updatedAt)]],
        ["traits", traited(thread, minded(world))],
        ["relations", [modeled(thread.mode), row("user", thread.user === null ? null : thread.user.slug)]],
        [
          "stores",
          [
            link("$turns", world.turns.length, "turns", { bang: world.turns.some(faulted) }),
            link("$buffers", world.buffers.length, "buffers"),
            link("$activities", world.activities.length, "activities"),
            row("$children", thread.$children.get().length),
          ],
        ],
      ],
    },
    [minding(world), turned(world), buffered(world), acted(world)],
  );
};

const harnessable = (mode) => mode !== null && typeof mode === "object" && mode.metadata !== null && Object.hasOwn(mode.metadata, "harness");

const minding = (world) => {
  const held = harness(world.app.client.runtime, world.thread);
  const mode = world.thread.mode;
  const model = held.model === undefined ? null : held.model;
  const id = harnessable(mode) ? `${mode.reference.absolute}/harness` : null;
  return node("harness", "harness", "harness", {
    quiet: model === null ? "—" : model.id,
    title: "resolved",
    ref: "harness(runtime, thread)",
    secs: [
      ["harnessed", harnessedTrait(world)],
      ["model", model === null ? [row("model", null, { q: "no cortex answers" })] : Object.entries(model).filter(([, value]) => scalar(value) || Array.isArray(value)).map(([key, value]) => row(key, value))],
      ["models", (held.models === undefined ? [] : held.models).map((each) => row(each.id, each.tier, { q: each.provider }))],
      ...(id === null ? [] : [["mode harness", [link("tools", count(stripped("", "", mode.metadata.harness.tools, "tool")), `${id}/tools`), link("primer", count(stripped("", "", mode.metadata.harness.primer, "primer")), `${id}/primer`), link("references", count(stripped("", "", mode.metadata.harness.references, "reference")), `${id}/references`)]]]),
    ],
  });
};

const PARTS = {
  text: (part) => part.text,
  tool_use: (part) => `tool_use ${part.name}`,
  tool_result: (part) => `tool_result ${part.isError === true ? "ERROR" : "ok"}`,
};
const parted = (part) => (Object.hasOwn(PARTS, part.type) ? PARTS[part.type](part) : part.type);
const faulted = (turn) => turn.meta !== null && turn.meta.fault !== undefined;

const turned = (world) =>
  node("turns", "turns", "turns", {
    sign: "┴",
    title: String(world.turns.length),
    ref: "thread.$turns",
    tail: "count",
    count: String(world.turns.length),
    bang: world.turns.some(faulted),
    secs: [
      [
        "chain",
        world.turns.map((turn, index) =>
          row(`${index + 1} ${turn.role}`, turn.parts.length ? turn.parts.map(parted).join(" · ") : "parts []", {
            cls: faulted(turn) ? "is-fault" : "",
            bang: faulted(turn),
            q: turn.meta === null || turn.meta.usage === undefined ? "" : `${amount(turn.meta.usage, "input", "tokens")} / ${amount(turn.meta.usage, "output", "tokens")}`,
          }),
        ),
      ],
    ],
  });

const buffered = (world) =>
  node(
    "buffers",
    "buffers",
    "buffers",
    {
      sign: "◆",
      title: String(world.buffers.length),
      ref: "thread.$buffers",
      tail: "count",
      count: String(world.buffers.length),
      secs: [["own", [row("buffers", world.buffers.length), row("seated", world.seated === null ? null : world.seated.trait.LABELED.name)]]],
    },
    world.buffers.map((buffer) =>
      node(`buffer/${buffer.id}`, buffer.trait.LABELED.name, "buffer", {
        sign: "◆",
        ref: buffer.id,
        tail: world.seated === buffer ? "seated" : "",
        keys: [buffer.id],
        secs: [
          ["own", [row("id", buffer.id), row("status", buffer.status), row("mime", buffer.mime), row("index", buffer.index)]],
          ["traits", traited(buffer)],
          ["relations", [modeled(buffer.mode)]],
        ],
      }),
    ),
  );

const acted = (world) =>
  node(
    "activities",
    "activities",
    "activities",
    { title: `${world.activities.length} running`, ref: "thread.$activities", tail: "count", count: String(world.activities.length), secs: [["store", [row("running", world.activities.length, { q: "a settled one leaves" })]]] },
    world.activities.map((activity) =>
      node(`activity/${activity.id}`, activity.type.toLowerCase(), "activity", {
        quiet: activity.status,
        ref: activity.id,
        keys: [`activity/${activity.id}`],
        bang: activity.error !== undefined,
        secs: [
          [
            "own",
            [
              row("id", activity.id),
              row("type", activity.type),
              row("status", activity.status),
              row("steps", activity.steps.length),
              row("error", activity.error === undefined ? null : activity.error.message, { cls: activity.error === undefined ? "" : "is-fault" }),
            ],
          ],
        ],
      }),
    ),
  );

const repled = (world) => {
  const commands = stripped("repl", "", shape.strip(world.terminal.repl.commands), "command");
  return node("repl", "repl", "repl", { quiet: `${count(commands)} commands`, title: "commands", ref: "terminal.repl.commands" }, commands);
};

const bridged = (world) => {
  const bridge = world.app.bridge;
  const stores = Object.keys(bridge).filter((key) => key.startsWith("$"));
  const EDITS = {
    $sidebar: (value) => edit("$sidebar", String(value.open), { path: "bridge.sidebar", kind: "choice", opts: ["true", "false"] }, { q: `width ${value.width}` }),
    $hidden: (value) => edit("$hidden", value, { path: "bridge.hidden", kind: "set", opts: GROUPS }),
  };
  return node("bridge", "bridge", "bridge", {
    quiet: String(stores.length),
    title: `${stores.length} stores`,
    ref: "app.bridge",
    secs: [["stores", stores.map((key) => (Object.hasOwn(EDITS, key) ? EDITS[key](bridge[key].get()) : row(key, bridge[key].get())))]],
  });
};

const telemetered = (world) => {
  const records = world.app.telemetry.$logger.get();
  return node("telemetry", "telemetry", "telemetry", {
    ref: "viva.telemetry.state",
    tail: "count",
    count: String(records.length),
    all: true,
    acts: ["clear"],
    secs: [
      ["$logger", [row("source", "client.controller.stdout.$history"), row("records", records.length)]],
      ["by track", Object.entries(Object.groupBy(records, (record) => record.track)).map(([track, held]) => row(track, held.length, { cls: track === "fault" ? "is-fault" : "" }))],
    ],
  });
};

export const tree = (world) =>
  node(
    "app",
    "app",
    "app",
    {
      ref: world.app.client.mask.manifest.slug,
      all: true,
      secs: [["own", [edit("theme", world.app.theme, { nature: "/theme", path: "app.theme", kind: "choice", opts: THEMES }, { q: "bridge › mask › user" })]]],
    },
    [clientele(world), bridged(world), telemetered(world)],
  );

export const flat = (root, up = []) => [{ node: root, lineage: up }, ...root.kids.flatMap((kid) => flat(kid, [...up, root]))];

export const reach = (root) => new Set([...root.keys, ...root.kids.flatMap((kid) => [...reach(kid)])]);

export const indexed = (root) => {
  const held = flat(root);
  return { root, held, by: new Map(held.map((entry) => [entry.node.id, entry])) };
};

const owner = (entry) => {
  const kinds = Object.hasOwn(OWNERS, entry.node.kind) ? OWNERS[entry.node.kind] : ["mode"];
  const found = entry.lineage.filter((above) => kinds.includes(above.kind));
  return found.length ? found.at(-1) : entry.lineage.at(-1);
};

const spoken = (entry) =>
  [entry.node.name, entry.node.quiet, entry.node.title, entry.node.kind, ...entry.node.secs.flatMap(([, rows]) => rows.map((held) => `${held.k} ${held.v}`))]
    .join(" ")
    .toLowerCase();

export const lensed = (index, lens, query, point) => {
  const items = index.held.filter((entry) => entry.node.kind === lens && (query === "" || spoken(entry).includes(query)));
  return [...Map.groupBy(items, owner)].flatMap(([head, held]) => [
    { id: `${head.id}:${lens}`, go: head.id, depth: 0, sign: "◇", name: head.name, strong: true, quiet: "", bang: false, tail: "count", tailText: String(held.length), cur: head.id === point, kids: false },
    ...held.map((entry) => ({
      id: entry.node.id,
      go: entry.node.id,
      depth: 1,
      sign: "",
      name: entry.node.as === undefined ? entry.node.name : entry.node.as,
      strong: false,
      quiet: entry.node.as === undefined ? entry.node.quiet : "",
      bang: entry.node.bang,
      tail: "",
      tailText: "",
      cur: entry.node.id === point,
      kids: false,
    })),
  ]);
};

const TAILS = [
  [(held) => held.tail === "dot", () => ["dot", ""]],
  [(held) => held.tail === "count", (held) => ["count", held.count]],
  [(held) => held.tail !== "", (held) => ["live", held.tail]],
  [() => true, () => ["", ""]],
];

export const treed = (index, folds, query, point) => {
  const shown =
    query === ""
      ? index.held.filter((entry) => entry.lineage.every((above) => folds[above.id] === true))
      : index.held.filter((entry) => `${entry.node.name} ${entry.node.quiet} ${entry.node.kind}`.toLowerCase().includes(query));
  return shown.map((entry) => {
    const kids = entry.node.kids.length > 0;
    const [tail, tailText] = TAILS.find(([test]) => test(entry.node))[1](entry.node);
    return {
      id: entry.node.id,
      go: entry.node.id,
      depth: query === "" ? entry.lineage.length : 0,
      sign: kids ? (folds[entry.node.id] === true ? "▾" : "▸") : entry.node.sign,
      name: entry.node.name,
      strong: kids,
      quiet: query === "" ? entry.node.quiet : entry.lineage.slice(-2).map((above) => above.name).join(" › "),
      bang: entry.node.bang,
      tail,
      tailText,
      cur: entry.node.id === point,
      kids,
    };
  });
};

export const lenses = (index, lens) =>
  LENSES.map(([id, label]) => ({ id, label, n: id === "tree" ? "" : String(index.held.filter((entry) => entry.node.kind === id).length), cur: id === lens }));

const SIGNALS = {
  attach: (held) => `/mode ${held.ref}`,
  load: (held) => `/${held.verb}/load ${held.ref}`,
  preload: (held) => `/${held.verb}/preload ${held.ref}`,
  unload: (held) => `/${held.verb}/unload ${held.ref}`,
  send: (held) => held.name,
  clear: () => "/telemetry/clear",
  new: () => "/terminal/new",
  close: () => "/terminal/close",
  login: () => "/lighthouse/login",
  logout: () => "/lighthouse/logout",
};

const acting = (held) => (name) => (name === "read" ? { name, kind: "read", path: held.primer } : { name, kind: "signal", signal: SIGNALS[name](held) });

export const picked = (index, point) => {
  const entry = index.by.has(point) ? index.by.get(point) : index.by.get("app");
  const held = entry.node;
  return {
    id: held.id,
    kind: held.kind,
    title: held.title,
    ref: held.ref,
    crumbs: entry.lineage.map((above) => ({ id: above.id, name: above.name })),
    lineage: entry.lineage.map((above) => above.id),
    acts: held.acts.map(acting(held)),
    sections: [
      ...held.secs.map(([label, rows]) => ({ label, rows })),
      ...(held.kids.length ? [{ label: "holds", rows: held.kids.map((kid) => link(kid.kind === kid.name ? "" : kid.kind, kid.name, kid.id, { q: kid.quiet, bang: kid.bang })) }] : []),
    ],
    reach: reach(held),
    all: held.all,
  };
};
