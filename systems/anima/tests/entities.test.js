import { specimen, v } from "@vivalence/typology";
import * as entities from "../src/skins/chrome/panels/telemetry/entities.js";
import * as spans from "../src/skins/chrome/panels/telemetry/spans.js";

const HARNESS = {
  references: { branches: { dialogue: { branches: { stream: { branches: {}, effect: { input: { type: "object" }, yields: {} } } } } } },
  primer: {
    branches: {
      identity: { branches: {}, effect: {} },
      hello: { meta: { load: "lazy" }, branches: { greet: { branches: {}, effect: {} } } },
    },
  },
  tools: {
    branches: {
      lookup: {
        branches: {},
        effect: {
          valence: "Consult the index.",
          input: { type: "object", required: ["query"], properties: { query: { type: "string", description: "what to find" }, hold: { type: "integer", minimum: 1, maximum: 9 } } },
        },
      },
    },
  },
};

const { node } = entities;

const TREE = node("app", "app", "app", { all: true }, [
  node("client", "client", "client", { keys: ["client"] }, [
    node("/runtime/stub/mode/chat/chat", "chat/chat", "mode", { sign: "◇", keys: ["/runtime/stub/mode/chat/chat"], acts: ["attach"], ref: "/runtime/stub/mode/chat/chat" }, [
      ...entities.stripped("/runtime/stub/mode/chat/chat/harness/tools", "/tools", HARNESS.tools, "tool"),
      ...entities.stripped("/runtime/stub/mode/chat/chat/harness/primer", "/primer", HARNESS.primer, "primer"),
    ]),
    node("terminal", "terminal", "terminal", { keys: ["terminal/T"], acts: ["new"] }, [node("thread", "[ memo ]", "thread", { keys: ["X"], bang: true })]),
    node("repl", "repl", "repl", {}, entities.stripped("repl", "", { branches: { mode: { branches: {}, effect: { valence: "move", input: { type: "object", required: ["reference"], properties: { reference: { type: "string" } } } } }, modes: { branches: {}, effect: { chord: "leader/m" } } } }, "command")),
  ]),
]);

const index = entities.indexed(TREE);

specimen.describe("the inspector's entity tree — one node per entity or face, read live", () => {
  specimen.it("a tool leaf shows its effect, its input from the schema, its address; a primer inherits its branch's load", () => {
    const lookup = index.by.get("/runtime/stub/mode/chat/chat/harness/tools/lookup").node;
    specimen.expect([lookup.kind, lookup.as, lookup.secs.map(([label]) => label)]).toEqual(["tool", "lookup", ["effect", "input", "address"]]);
    specimen.expect(lookup.secs[1][1].map((row) => [row.k, row.v, row.q])).toEqual([["query", "string", "what to find"], ["hold?", "integer 1–9", ""]]);
    const greet = index.by.get("/runtime/stub/mode/chat/chat/harness/primer/hello/greet").node;
    specimen.expect([greet.kind, greet.quiet, greet.primer, greet.acts]).toEqual(["primer", "lazy", "hello/greet", ["read"]]);
    specimen.expect(index.by.get("/runtime/stub/mode/chat/chat/harness/primer/hello").node.kind).toBe("branch");
  });

  specimen.it("a command is its nature, its key, sendable only when it takes no required input", () => {
    const mode = index.by.get("repl/mode").node;
    const modes = index.by.get("repl/modes").node;
    specimen.expect([mode.name, mode.keys, mode.acts, modes.acts, modes.quiet]).toEqual(["/mode", ["/mode"], [], ["send"], "leader/m"]);
    specimen.expect(entities.count(index.by.get("repl").node.kids)).toBe(2);
  });

  specimen.it("the tree shows what its folds open; a query flattens to matches with their trail", () => {
    const folded = entities.treed(index, { app: true }, "", "app");
    specimen.expect(folded.map((held) => [held.name, held.depth, held.sign, held.cur])).toEqual([["app", 0, "▾", true], ["client", 1, "▸", false]]);
    const found = entities.treed(index, {}, "memo", "thread");
    specimen.expect(found.map((held) => [held.name, held.quiet, held.depth, held.bang, held.cur])).toEqual([["[ memo ]", "client › terminal", 0, true, true]]);
  });

  specimen.it("a lens lists one kind grouped under its owner, counted", () => {
    const tools = entities.lensed(index, "tool", "", "/runtime/stub/mode/chat/chat/harness/tools/lookup");
    specimen.expect(tools.map((held) => [held.name, held.depth, held.tailText, held.cur])).toEqual([["chat/chat", 0, "1", false], ["lookup", 1, "", true]]);
    const commands = entities.lensed(index, "command", "move", null);
    specimen.expect(commands.map((held) => held.name)).toEqual(["repl", "/mode"]);
    specimen.expect(entities.lenses(index, "tool").filter((lens) => lens.cur || lens.n !== "0").map((lens) => [lens.id, lens.n])).toEqual([["tree", ""], ["tool", "1"], ["primer", "2"], ["command", "2"], ["mode", "1"]]);
  });

  specimen.it("a picked entity carries its lineage, its acts as signals, its children as links, the keys a span must name to touch it", () => {
    const mode = entities.picked(index, "/runtime/stub/mode/chat/chat");
    specimen.expect(mode.crumbs.map((crumb) => crumb.id)).toEqual(["app", "client"]);
    specimen.expect(mode.acts).toEqual([{ name: "attach", kind: "signal", signal: "/mode /runtime/stub/mode/chat/chat" }]);
    specimen.expect(mode.sections.at(-1).rows.map((row) => [row.k, row.v, row.go])).toEqual([
      ["tool", "lookup", "/runtime/stub/mode/chat/chat/harness/tools/lookup"],
      ["primer", "identity", "/runtime/stub/mode/chat/chat/harness/primer/identity"],
      ["branch", "hello", "/runtime/stub/mode/chat/chat/harness/primer/hello"],
    ]);
    specimen.expect([...entities.picked(index, "terminal").reach]).toEqual(["terminal/T", "X"]);
    specimen.expect(entities.picked(index, "/runtime/stub/mode/chat/chat/harness/primer/identity").acts).toEqual([{ name: "read", kind: "read", path: "identity" }]);
    specimen.expect(entities.picked(index, "gone").id).toBe("app");
  });

  specimen.it("a value says itself in one cell: scalars, flat lists, flat objects; a nested one names its keys", () => {
    specimen.expect([null, undefined, [], ["a", "b"], [{}], {}, { tier: "fast", rounds: 3 }, { a: { b: 1 } }].map(entities.said)).toEqual([
      "null",
      "undefined",
      "[]",
      "a · b",
      "[1]",
      "{}",
      "tier fast · rounds 3",
      "{a}",
    ]);
  });
});

const at = (n) => 1000 + n;
const RECORDS = [
  { at: at(0), path: ["anima", "client"], track: "start", data: null },
  { at: at(1), path: ["anima", "client", "terminal/T", "/mode"], track: "start", data: null },
  { at: at(4), path: ["anima", "client", "terminal/T", "/mode"], track: "stop", data: null },
  { at: at(5), path: ["anima", "client", "terminal/T", "/nonsense"], track: "start", data: null },
  { at: at(6), path: ["anima", "client", "terminal/T", "/nonsense"], track: "fault", data: { type: "Error", message: "Not found", code: "NOT_FOUND", stack: "Error: Not found" } },
  { at: at(7), path: ["anima", "client", "lighthouse"], track: "status", data: { code: "AUTHENTICATED" } },
];

const failed = {
  id: "A",
  type: "HALLUCINATION",
  status: "FAILED",
  error: new Error("scripted fatal fault"),
  steps: [
    { at: at(2), path: ["hallucination"], track: "start", data: null },
    { at: at(3), path: ["hallucination", "srs_lookup"], track: "fault", data: { type: "Error", message: "Validation failed" } },
  ],
};

specimen.describe("the spans both tabs draw — client records and live activities, one timeline", () => {
  const list = spans.spans({ records: RECORDS, activities: [failed], since: 0, now: at(10) });

  specimen.it("a span whose parent sent no record hangs under its nearest ancestor that did, never as a root", () => {
    const arranged = spans.arrange(list);
    specimen.expect(arranged.map((held) => [held.span.nature, held.depth])).toEqual([
      ["client", 0],
      ["/mode", 1],
      ["/nonsense", 1],
      ["lighthouse", 1],
      ["hallucination", 0],
      ["hallucination", 1],
      ["srs_lookup", 2],
    ]);
  });

  specimen.it("an activity's fault is read off its controller; its root carries the signals, a step none", () => {
    const root = list.find((span) => span.id === "activity/A");
    specimen.expect([root.code, root.fault.message, root.kind]).toEqual(["FAILED", "scripted fatal fault", "activity"]);
    specimen.expect(spans.detail(root).signals.map((held) => [held.signal, held.off])).toEqual(v.primitives.controller.SIGNALS.map((sig) => [spans.SIGNALS[sig], true]));
    specimen.expect(spans.detail(list.find((span) => span.nature === "srs_lookup")).signals).toEqual([]);
  });

  specimen.it("the logger counts every filter; faults hold a faulted span and every span above it", () => {
    const logged = spans.logger({ list, filter: "faults", selection: null });
    specimen.expect(logged.filters.map((held) => [held.id, held.n])).toEqual([["all", 7], ["activity", 3], ["repl", 4], ["net", 0], ["faults", 5]]);
    specimen.expect(logged.rows.map((row) => [row.name, row.tone, row.bang])).toEqual([
      ["client", "live", true],
      ["/nonsense", "fault", false],
      ["hallucination", "fault", false],
      ["hallucination", "done", true],
      ["srs_lookup", "fault", false],
    ]);
    specimen.expect(logged.faults).toBe(3);
  });

  specimen.it("a picked entity's trace is the spans whose path names a key it reaches; its detail is the picked span", () => {
    const terminal = { reach: new Set(["terminal/T"]), all: false };
    const held = spans.traced({ list, node: terminal, only: "all", selection: spans.story(RECORDS, { clock: at(10) })[2].id });
    specimen.expect([held.all, held.faults, held.rows.map((row) => row.name)]).toEqual([2, 1, ["/mode", "/nonsense"]]);
    specimen.expect([held.detail.nature, held.detail.fault.code, held.detail.entries.map((entry) => [entry.track, entry.rel, entry.data])]).toEqual(["/nonsense", "NOT_FOUND", [["start", 0, ""], ["fault", 1, "Not found · NOT_FOUND"]]]);
    specimen.expect(spans.traced({ list, node: terminal, only: "faults", selection: null }).rows.map((row) => row.name)).toEqual(["/nonsense"]);
    specimen.expect(spans.traced({ list, node: { reach: new Set(), all: true }, only: "all", selection: null }).all).toBe(7);
  });

  specimen.it("a status says its code, measured from the span's first record", () => {
    const lighthouse = spans.detail(list.find((span) => span.nature === "lighthouse"));
    specimen.expect(lighthouse.entries).toEqual([{ track: "status", rel: 0, data: "AUTHENTICATED" }]);
  });

  specimen.it("a clear moves the watermark: records at or before it leave, activities stay", () => {
    const cleared = spans.spans({ records: RECORDS, activities: [failed], since: at(5), now: at(10) });
    specimen.expect(cleared.map((span) => span.nature)).toEqual(["/nonsense", "lighthouse", "hallucination", "hallucination", "srs_lookup"]);
  });
});
