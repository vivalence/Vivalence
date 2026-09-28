import { specimen } from "@vivalence/typology";
import { atom } from "nanostores";
import { BOX, BRIDGE, TERMINALS } from "../../src/client.js";
import { CLIENT, ENTRY, KIT, SRC, build, dom, fire, keys, words } from "./rig.js";

const ANIMA = [
  `export { chain } from "${new URL("typology/gestalten/belt/chain.js", SRC).href}";`,
  `export { dictation } from "${new URL("typology/prototypes/dictation.js", SRC).href}";`,
  `export { TONES, loudest, owed, roster } from "${new URL("typology/entities/activity.js", SRC).href}";`,
  `import * as bridge from "${new URL("typology/stores/bridge/dock.js", SRC).href}";`,
  "export const stores = { bridge };",
].join("\n");

const WIDGETS = {
  Dock: new URL("app/panels/a/widgets/Dock.svelte", SRC),
  DockHead: new URL("app/panels/a/widgets/DockHead.svelte", SRC),
  Turn: new URL("app/panels/a/widgets/Turn.svelte", SRC),
  LiveTurn: new URL("app/panels/a/widgets/LiveTurn.svelte", SRC),
  Composer: new URL("app/panels/a/widgets/Composer.svelte", SRC),
  Dictaphone: new URL("app/panels/a/widgets/Dictaphone.svelte", SRC),
  Tune: new URL("app/widgets/Tune.svelte", SRC),
  stop: new URL("app/panels/a/widgets/stop.svelte.js", SRC),
  ...KIT,
};

const HISTORY = [
  { id: "u1", role: "user", createdAt: "2026-09-28T09:00:00.000Z", parts: [{ type: "text", text: "what is due?" }] },
  { id: "a1", role: "assistant", createdAt: "2026-09-28T09:00:05.000Z", parts: [{ type: "text", text: "three cards are due." }] },
];

const ANSWER = [
  { event: "/turn/open", turn: { role: "assistant" } },
  { event: "/part/open", index: 0, part: { type: "text", text: "" } },
  { event: "/part/delta", index: 0, delta: { text: "Nf3 it is" } },
  { event: "/part/close", index: 0 },
  { event: "/turn/close", meta: { state: "complete" } },
];

const gate = () => {
  let open;
  const passed = new Promise((resolve) => (open = resolve));
  return { open, passed };
};

const row = (id, status) => {
  const signals = [];
  return {
    id,
    status,
    thread: "t1",
    signals,
    stdin: {
      SIGTERM: (input) => Promise.resolve(void signals.push(["SIGTERM", input])),
      SIGKILL: (input) => Promise.resolve(void signals.push(["SIGKILL", input])),
    },
  };
};

const world = ({ traits = ["HARNESSED"], turns = [], rows = [] } = {}) => {
  const asked = [];
  const gates = [gate(), gate()];
  async function* stream(request) {
    asked.push(request);
    await gates[0].passed;
    for (const packet of ANSWER.slice(0, 3)) yield packet;
    await gates[1].passed;
    for (const packet of ANSWER.slice(3)) yield packet;
  }
  const daemon = { slug: "italian", cortex: { find: () => [] }, entities: { activity: { $entities: atom(rows) } } };
  const mode = { slug: "dealer", daemon, implements: (trait) => traits.includes(trait), harness: { dialogue: { stream } } };
  const thread = {
    id: "t1",
    daemon,
    mode,
    $mode: atom(mode),
    $turns: atom(turns),
    $buffers: atom([]),
    $trait: atom({}),
    $traits: atom([]),
    $label: atom({ name: "evening deck" }),
  };
  const terminal = {
    id: "one",
    thread,
    $thread: atom(thread),
    $buffer: atom(null),
    $dock: atom({ side: "right", share: 0.32, collapsed: false, full: false }),
  };
  const $active = atom(terminal);
  const terminals = {
    $active,
    get active() {
      return $active.get();
    },
  };
  const context = new Map([
    [TERMINALS, terminals],
    [BRIDGE, { $composer: atom({ enterSends: true }) }],
    [BOX, { device: { microphone: { $level: atom(0) } } }],
  ]);
  return { asked, gates, thread, terminal, context };
};

const settle = async (flush) => {
  for (let turn = 0; turn < 6; turn += 1) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    flush();
  }
};

specimen.describe("the dock — mounted whole: the log, the echo, the stream, the keys", () => {
  let directory, document, mount, unmount, flush, Dock;
  const mounted = [];
  const dumps = [];
  const silenced = console.error;

  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "anima-dock-whole-" });
    document = dom();
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    await Deno.writeTextFile(`${directory}/anima.js`, ANIMA);
    const load = await build(directory, WIDGETS, [[/from "@vivalence\/anima"/g, 'from "./anima.js"']]);
    ({ default: Dock } = await load("Dock"));
    console.error = (...args) => dumps.push(String(args[0]?.name ?? args[0]));
  });
  specimen.afterEach(async () => {
    for (const app of mounted.splice(0)) unmount(app);
    await settle(flush);
    document.body.innerHTML = "";
  });
  specimen.afterAll(async () => {
    console.error = silenced;
    await Deno.remove(directory, { recursive: true });
  });

  const dock = (held, props = {}) => {
    const target = document.body.appendChild(document.createElement("div"));
    mounted.push(mount(Dock, { target, props: { thread: held.thread, ...props }, context: held.context }));
    flush();
    const field = target.getElementsByTagName("textarea")[0];
    const key = (word) => keys(target).find((button) => words(button) === word) ?? null;
    const type = (text) => {
      field.value = text;
      fire(field, "input");
      flush();
    };
    const press = (name, more = {}) => {
      const prevented = [];
      fire(field, "keydown", { key: name, shiftKey: false, preventDefault: () => prevented.push(name), ...more });
      flush();
      return prevented;
    };
    return { target, field, key, type, press };
  };

  specimen.it("an empty thread says begin, one with no harness says so, and nothing loops", () => {
    const begun = dock(world());
    specimen.expect(words(begun.target)).toContain("evening deck");
    specimen.expect(words(begun.target)).toContain("begin");
    specimen.expect(begun.field.getAttribute("placeholder")).toBe("message… (shift+enter for newline)");

    const bare = dock(world({ traits: [] }));
    specimen.expect(words(bare.target)).toContain("no harness");
    specimen.expect(bare.field.getAttribute("placeholder")).toBe("—");
    specimen.expect([bare.field.hasAttribute("disabled"), bare.field.hasAttribute("readonly")]).toEqual([false, false]);
    specimen.expect(dumps).toEqual([]);
  });

  specimen.it("the thread's turns are the log: a day rule, my bubble, their turn under the thread's name", () => {
    const { target } = dock(world({ turns: HISTORY }));
    specimen.expect(target.getElementsByClassName("turn-day")).toHaveLength(1);
    specimen.expect(target.getElementsByClassName("turn-bubble")).toHaveLength(1);
    const [mine, theirs] = [...target.getElementsByClassName("turn")].map((turn) => words(turn));
    specimen.expect(mine.startsWith("what is due? ⧉ retry you · ")).toBe(true);
    specimen.expect(theirs.startsWith("evening deck ")).toBe(true);
    specimen.expect(theirs.endsWith(" ⧉ three cards are due.")).toBe(true);
    specimen.expect(words(target)).not.toContain("begin");
  });

  specimen.it("enter sends the draft under a client id: the echo, the live turn, then the reset", async () => {
    const held = world({ turns: HISTORY });
    const { target, field, type, press, key } = dock(held);
    specimen.expect(Boolean(key("").disabled)).toBe(true);
    type("Nf3?");
    specimen.expect(press("Enter", { shiftKey: true })).toEqual([]);
    specimen.expect(held.asked).toEqual([]);

    specimen.expect(press("Enter")).toEqual(["Enter"]);
    await settle(flush);
    specimen.expect(held.asked).toHaveLength(1);
    const [{ thread, id, parts }] = held.asked;
    specimen.expect([thread, parts]).toEqual(["t1", [{ type: "text", text: "Nf3?" }]]);
    specimen.expect(field.value).toBe("");
    specimen.expect(target.getElementsByClassName("turn-bubble")).toHaveLength(2);
    specimen.expect(words(target)).toContain("Nf3?");
    specimen.expect(words(target.getElementsByClassName("live-turn")[0])).toContain("thinking");
    specimen.expect(Boolean(key("stop"))).toBe(true);

    held.thread.$turns.set([...HISTORY, { id, role: "user", createdAt: new Date().toISOString(), parts }]);
    held.gates[0].open();
    await settle(flush);
    specimen.expect(target.getElementsByClassName("turn-bubble")).toHaveLength(2);
    const live = words(target.getElementsByClassName("live-turn")[0]);
    specimen.expect(live).toContain("streaming");
    specimen.expect(live).toContain("Nf3 it is");

    held.gates[1].open();
    await settle(flush);
    specimen.expect(target.getElementsByClassName("live-turn")).toHaveLength(0);
    specimen.expect(target.getElementsByClassName("turn-bubble")).toHaveLength(2);
    specimen.expect(Boolean(key("stop"))).toBe(false);
    specimen.expect(dumps).toEqual([]);
  });

  specimen.it("arrow up on an empty draft recalls my last turn", async () => {
    const { field, press } = dock(world({ turns: HISTORY }));
    specimen.expect(press("ArrowUp")).toEqual(["ArrowUp"]);
    await settle(flush);
    specimen.expect(field.value).toBe("what is due?");
    specimen.expect(press("ArrowUp")).toEqual([]);
  });

  specimen.it("escape stops a thread that runs: SIGTERM to its live row, the stop key in the send key's place", async () => {
    const running = row("a-1", "RUNNING");
    const { press, key } = dock(world({ rows: [running] }));
    specimen.expect([Boolean(key("stop")), Boolean(key(""))]).toEqual([true, false]);
    specimen.expect(press("Escape")).toEqual(["Escape"]);
    await settle(flush);
    specimen.expect(running.signals).toEqual([["SIGTERM", "user pressed stop"]]);
  });

  specimen.it("the head's keys write the terminal's dock", () => {
    const held = world();
    const { target, key } = dock(held);
    fire(key("⤢"), "click", { detail: 1 });
    flush();
    specimen.expect(held.terminal.$dock.get().full).toBe(true);
    specimen.expect(target.getElementsByClassName("dock")[0].classList.contains("full")).toBe(true);

    fire(key("→"), "click", { detail: 1 });
    flush();
    const rows = [...document.body.getElementsByClassName("float")[0].getElementsByClassName("row")];
    fire(rows[2], "click", { detail: 1 });
    flush();
    specimen.expect(held.terminal.$dock.get().side).toBe("bottom");
    specimen.expect(Boolean(key("↓"))).toBe(true);

    fire(key("×"), "click", { detail: 1 });
    specimen.expect(held.terminal.$dock.get().collapsed).toBe(true);
  });

  specimen.it("the meta bar opens its three chips; a chip latches and hands its name up — the dock itself opens no console", () => {
    const heard = [];
    const { target, key } = dock(world({ turns: HISTORY }), { onconsole: (name) => heard.push(name) });
    specimen.expect(target.getElementsByClassName("dock-meta")).toHaveLength(0);
    fire(key("⋮⋮ meta"), "click", { detail: 1 });
    flush();
    const before = target.getElementsByTagName("*").length;

    fire(key("meter"), "click", { detail: 1 });
    flush();
    specimen.expect(key("meter").classList.contains("latched")).toBe(true);
    specimen.expect(target.getElementsByTagName("*").length).toBe(before);

    fire(key("activity"), "click", { detail: 1 });
    flush();
    specimen.expect([key("meter").classList.contains("latched"), key("activity").classList.contains("latched")]).toEqual([false, true]);

    fire(key("activity"), "click", { detail: 1 });
    fire(key("context"), "click", { detail: 1 });
    fire(key("⋮⋮ meta"), "click", { detail: 1 });
    flush();
    specimen.expect(heard).toEqual(["meter", "activity", null, "context", null]);
    specimen.expect(target.getElementsByClassName("dock-meta")).toHaveLength(0);
  });
});
