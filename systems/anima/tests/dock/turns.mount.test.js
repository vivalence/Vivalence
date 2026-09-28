import { specimen } from "@vivalence/typology";
import { enrich, usages } from "../../src/app/panels/a/widgets/turns.js";
import { CLIENT, ENTRY, KIT, SRC, build, dom, fire, keys, words } from "./rig.js";

const WIDGETS = {
  DockHead: new URL("app/panels/a/widgets/DockHead.svelte", SRC),
  Turn: new URL("app/panels/a/widgets/Turn.svelte", SRC),
  LiveTurn: new URL("app/panels/a/widgets/LiveTurn.svelte", SRC),
  Key: KIT.Key,
  Json: KIT.Json,
  Markdown: KIT.Markdown,
  Meter: KIT.Meter,
  Row: KIT.Row,
  Section: KIT.Section,
  Status: KIT.Status,
  Tag: KIT.Tag,
  ToolRow: KIT.ToolRow,
  Well: KIT.Well,
  Float: KIT.Float,
};

const NOW = new Date("2026-09-28T12:00:00.000Z");

const THREAD = [
  { id: "u1", role: "user", createdAt: "2026-09-28T09:00:00.000Z", parts: [{ type: "text", text: "what is due?" }] },
  {
    id: "a1",
    role: "assistant",
    createdAt: "2026-09-28T09:00:02.000Z",
    meta: { usage: { input_tokens: 1200, output_tokens: 40 } },
    parts: [
      { type: "thinking", text: "the queue holds three cards" },
      { type: "tool_use", id: "call-1", name: "queue_due", input: { limit: 3 } },
      { type: "tool_use", id: "call-2", name: "queue_draw", input: { seat: 1 } },
    ],
  },
  {
    id: "r1",
    role: "user",
    createdAt: "2026-09-28T09:00:03.000Z",
    parts: [
      {
        type: "tool_result",
        tool_use_id: "call-1",
        output: {
          message: "three due",
          buffer: [{ id: "b1", index: 1, trait: { LABELED: { name: "the drawn card" } } }],
          literal: [{ id: "l1", slug: "casa", ontology: "noun", description: "house", strength: 0.8 }],
        },
      },
      { type: "tool_result", tool_use_id: "call-2", condition: "ERROR", output: "no seat" },
    ],
  },
  {
    id: "a2",
    role: "assistant",
    createdAt: "2026-09-28T09:00:05.000Z",
    meta: { usage: { input_tokens: 1500, output_tokens: 210 } },
    parts: [{ type: "text", text: "three cards are due." }],
  },
];

const LIVE = {
  kind: "turn",
  turn: { role: "assistant" },
  date: null,
  text: "drawing the",
  think: "",
  tools: [{ name: "queue_draw", digest: "seat 1", status: "running", output: null, channels: [] }],
  failures: 0,
  artifacts: [],
  buffers: [],
  verdict: null,
};

specimen.describe("the dock's widgets — mounted: the head, a turn, the live turn", () => {
  let directory, document, mount, unmount, flush, load;
  const mounted = [];

  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "anima-dock-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    load = await build(directory, WIDGETS);
  });
  specimen.afterEach(() => {
    for (const app of mounted.splice(0)) unmount(app);
    flush();
    document.body.innerHTML = "";
  });
  specimen.afterAll(async () => {
    await Deno.remove(directory, { recursive: true });
  });

  const seat = async (name, props) => {
    const { default: Widget } = await load(name);
    const target = document.body.appendChild(document.createElement("div"));
    mounted.push(mount(Widget, { target, props }));
    flush();
    return target;
  };

  const tap = (element) => {
    fire(element, "click", { detail: 1 });
    flush();
  };

  const items = enrich(THREAD, NOW);
  const spent = usages(items, THREAD);
  const [day, mine, theirs] = items;
  const launches = [{ id: "b1", label: "the drawn card", line: "italian › dealer", runnable: true, seated: false }];

  specimen.it("a day rule says its day; my turn is a bubble with you · at under it, copy and retry beside", async () => {
    specimen.expect(words(await seat("Turn", { item: day }))).toBe("today");

    const calls = [];
    const target = await seat("Turn", {
      item: mine,
      oncopy: (turn, tools) => calls.push(["copy", turn.id, tools.length]),
      onretry: (turn) => calls.push(["retry", turn.id]),
    });
    specimen.expect(words(target)).toContain("what is due?");
    specimen.expect(words(target)).toContain("you ·");
    specimen.expect(target.getElementsByClassName("turn-bubble")).toHaveLength(1);
    const [copy, retry] = keys(target);
    tap(copy);
    tap(retry);
    specimen.expect(calls).toEqual([["copy", "u1", 0], ["retry", "u1"]]);
  });

  specimen.it("their turn names who spoke, its manifest and what the joined turn spent", async () => {
    const target = await seat("Turn", { item: theirs, agent: "dealer", usage: spent.get("a1"), launches });
    const head = words(target.getElementsByClassName("turn-head")[0]);
    specimen.expect(head).toContain("dealer");
    specimen.expect(head).toContain("thinking · 2 calls");
    specimen.expect(head).toContain("1 failed");
    specimen.expect(head).toContain("2.7k → 250");
    specimen.expect(words(target)).toContain("three cards are due.");
  });

  specimen.it("a tool row is shut until its own toggle opens it; a failed call opens by itself", async () => {
    const target = await seat("Turn", { item: theirs, agent: "dealer", launches });
    const faces = [...target.getElementsByClassName("tool-face")];
    specimen.expect(faces.map((face) => words(face))).toEqual(["▸ queue_due limit 3 ok", "▸ queue_draw seat 1 error"]);
    specimen.expect(words(target)).not.toContain("three due");
    specimen.expect(words(target)).toContain("no seat");

    tap(faces[0]);
    specimen.expect(words(target)).toContain("three due");
    const heads = [...target.getElementsByClassName("section-head")].map((head) => words(head));
    specimen.expect(heads.slice(0, 3)).toEqual(["▸ input { limit }", "▸ buffer ×1", "▸ literal ×1"]);

    tap(faces[0]);
    specimen.expect(words(target)).not.toContain("three due");
  });

  specimen.it("a channel opens to its rows: term, kind, gloss, a meter; a buffer's row and its card both launch", async () => {
    const launched = [];
    const target = await seat("Turn", { item: theirs, agent: "dealer", launches, onlaunch: (buffer) => launched.push(buffer.id) });
    tap(target.getElementsByClassName("tool-face")[0]);
    const [, buffer, literal] = [...target.getElementsByClassName("section-head")];
    tap(literal);
    specimen.expect(words(target)).toContain("casa noun house");
    specimen.expect(target.getElementsByClassName("meter")).toHaveLength(1);

    tap(buffer);
    const row = [...target.getElementsByClassName("row")].find((held) => words(held).startsWith("the drawn card"));
    tap(row);
    const card = keys(target).find((key) => words(key).startsWith("the drawn card"));
    specimen.expect(words(card)).toBe("the drawn card italian › dealer");
    tap(card);
    specimen.expect(launched).toEqual(["b1", "b1"]);
  });

  specimen.it("a buffer the thread no longer holds launches nothing: its card is disabled, its row is no key", async () => {
    const launched = [];
    const gone = [{ ...launches[0], runnable: false }];
    const target = await seat("Turn", { item: theirs, launches: gone, onlaunch: (buffer) => launched.push(buffer.id) });
    tap(target.getElementsByClassName("tool-face")[0]);
    tap(target.getElementsByClassName("section-head")[1]);
    const card = keys(target).find((key) => words(key).startsWith("the drawn card"));
    specimen.expect(Boolean(card.disabled)).toBe(true);
    tap(card);
    specimen.expect(target.getElementsByClassName("click")).toHaveLength(0);
    specimen.expect(launched).toEqual([]);
  });

  specimen.it("thinking folds behind its own toggle, shows inline when the thread shows it, and is gone when it hides it", async () => {
    const folded = await seat("Turn", { item: theirs, thinking: null });
    specimen.expect(words(folded)).not.toContain("the queue holds three cards");
    tap([...folded.getElementsByClassName("section-head")].find((head) => words(head).includes("thinking")));
    specimen.expect(words(folded)).toContain("the queue holds three cards");

    const shown = await seat("Turn", { item: theirs, thinking: true });
    specimen.expect(words(shown)).toContain("the queue holds three cards");
    specimen.expect([...shown.getElementsByClassName("section-head")].some((head) => words(head).includes("thinking"))).toBe(false);

    const hidden = await seat("Turn", { item: theirs, thinking: false });
    specimen.expect(words(hidden)).not.toContain("thinking");
    specimen.expect(words(hidden)).not.toContain("the queue holds three cards");
  });

  specimen.it("the live turn says its state and its clock; a running call is a row with no toggle", async () => {
    const waiting = await seat("LiveTurn", { item: null, agent: "dealer", word: "thinking", elapsed: "0.4s" });
    specimen.expect(words(waiting)).toBe("dealer thinking 0.4s thinking");

    const calling = await seat("LiveTurn", { item: LIVE, agent: "dealer", word: "calling queue_draw", elapsed: "1.2s" });
    specimen.expect(words(calling.getElementsByClassName("turn-head")[0])).toBe("dealer calling queue_draw 1.2s");
    const face = calling.getElementsByClassName("tool-face")[0];
    specimen.expect(words(face)).toBe("queue_draw seat 1 running");
    specimen.expect(face.classList.contains("still")).toBe(true);
    specimen.expect(words(calling)).toContain("drawing the");
    specimen.expect(calling.getElementsByClassName("live-label")).toHaveLength(0);
  });

  specimen.it("the head names the thread and its state, and hands every key's press up", async () => {
    const calls = [];
    const props = {
      label: "evening deck",
      tone: "primary",
      word: "running",
      pulse: true,
      side: "right",
      sides: ["top", "right", "bottom", "left"],
      full: false,
      meta: false,
      consoles: ["context", "meter", "activity"],
      picked: null,
      onmeta: () => calls.push("meta"),
      onconsole: (name) => calls.push(`console ${name}`),
      onside: (name) => calls.push(`side ${name}`),
      onfull: () => calls.push("full"),
      oncollapse: () => calls.push("collapse"),
    };
    const target = await seat("DockHead", props);
    specimen.expect(words(target)).toBe("running evening deck ⋮⋮ meta → ⤢ ×");
    const [meta, side, full, collapse] = keys(target);
    tap(meta);
    tap(full);
    tap(collapse);
    specimen.expect(calls).toEqual(["meta", "full", "collapse"]);

    tap(side);
    const float = document.body.getElementsByClassName("float")[0];
    specimen.expect(float.parentNode.getAttribute("data-zone")).toBe("1");
    const rows = [...float.getElementsByClassName("row")];
    specimen.expect(rows.map((row) => words(row))).toEqual(["↑ top", "→ right", "↓ bottom", "← left"]);
    specimen.expect(rows.map((row) => row.classList.contains("selected"))).toEqual([false, true, false, false]);
    tap(rows[3]);
    specimen.expect(calls.at(-1)).toBe("side left");
    specimen.expect(document.body.getElementsByClassName("float")).toHaveLength(0);
  });

  specimen.it("the meta bar holds the three console chips; a chip hands its name up and latches when it is the picked one", async () => {
    const calls = [];
    const target = await seat("DockHead", {
      label: "evening deck",
      sides: ["top", "right", "bottom", "left"],
      meta: true,
      consoles: ["context", "meter", "activity"],
      picked: "meter",
      onconsole: (name) => calls.push(name),
    });
    const chips = [...target.getElementsByClassName("dock-meta")[0].getElementsByTagName("button")];
    specimen.expect(chips.map((chip) => words(chip))).toEqual(["context", "meter", "activity"]);
    specimen.expect(chips.map((chip) => chip.classList.contains("latched"))).toEqual([false, true, false]);
    tap(chips[0]);
    tap(chips[2]);
    specimen.expect(calls).toEqual(["context", "activity"]);
  });
});
