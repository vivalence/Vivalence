import { outline, plain, shape, table, wrap } from "../plain.js";
import { Span, specimen } from "@vivalence/typology";

const LISTING = {
  title: "viva",
  groups: [
    { title: "instance", rows: [{ name: "instance/create", usage: "[source] [target]", note: "create an instance" }] },
    { title: "help", rows: [{ name: "help", usage: "[filter]", note: "every nature" }] },
  ],
  notes: ["flags  --json  --verbose"],
  width: 80,
};

specimen.describe("table(rows, width) — columns inferred, empty columns dropped, shrunk widest-first", () => {
  specimen.it("lays a head and one line per row, two spaces between columns", () => {
    const laid = table([{ slug: "alpha", port: 2501 }, { slug: "beta", port: null }], 80);
    specimen.expect(laid.head).toBe("slug   port");
    specimen.expect(laid.body).toEqual(["alpha  2501", "beta   —   "]);
  });

  specimen.it("a column null in every row costs nothing", () => {
    specimen.expect(table([{ slug: "a", gone: null }, { slug: "b" }], 80).head).toBe("slug");
  });

  specimen.it("an overflowing path keeps its tail", () => {
    const laid = table([{ slug: "a", mount: "/very/long/path/to/the/instance/home" }], 24);
    specimen.expect(laid.body[0].length).toBeLessThanOrEqual(24);
    specimen.expect(laid.body[0]).toContain("…");
    specimen.expect(laid.body[0].trimEnd().endsWith("home")).toBe(true);
  });

  specimen.it("no rows → an empty head and no body", () => {
    specimen.expect(table([], 80)).toEqual({ head: "", body: [] });
  });
});

specimen.describe("outline(value) — an effect as report blocks", () => {
  specimen.it("leaves become key/value spans, a nested object a heading over its children", () => {
    const blocks = outline({ slug: "hello", nested: { port: 2501 } });
    specimen.expect(blocks[0]).toEqual({
      spans: [{ text: "slug", tone: "link", width: 30 }, { text: "hello", tone: "muted" }],
      depth: 0,
    });
    specimen.expect(blocks[1]).toEqual({ heading: "nested" });
    specimen.expect(blocks[2].depth).toBe(1);
    specimen.expect(blocks[2].spans[1].text).toBe("2501");
  });

  specimen.it("an array of flat objects is a table, a list of leaves one line", () => {
    const blocks = outline({ rows: [{ a: 1 }, { a: 2 }], tags: ["x", "y"], none: [] });
    specimen.expect(blocks[1]).toEqual({ table: [{ a: 1 }, { a: 2 }], depth: 1 });
    specimen.expect(blocks[2].spans[1].text).toBe("x  y");
    specimen.expect(blocks[3].spans[1].text).toBe("—");
  });

  specimen.it("a row whose cell is a list of leaves stays a table row, the list joined", () => {
    const rows = [{ slug: "srs", traits: ["EXPOSED", "TOOLING"] }, { slug: "latin-core", traits: ["DATASET"] }];
    specimen.expect(outline({ modes: rows })[1]).toEqual({ table: rows, depth: 1 });
    specimen.expect(table(rows, 80).body).toEqual(["srs         EXPOSED TOOLING", "latin-core  DATASET        "]);
  });

  specimen.it("a bare array of flat rows is a table at the root", () => {
    const rows = [{ slug: "srs" }, { slug: "latin-core" }];
    specimen.expect(outline(rows)).toEqual([{ table: rows, depth: 0 }]);
  });

  specimen.it("a bare value is one line", () => {
    specimen.expect(outline("done")).toEqual([{ spans: [{ text: "done", tone: "ink" }], depth: 0 }]);
  });
});

specimen.describe("plain — the pipe's rendering of a kind, no renderer", () => {
  specimen.it("report: a heading gets a blank line before it unless it opens the report", () => {
    const text = plain.report({
      width: 80,
      blocks: [
        { heading: "viva ledger/doctor" },
        { spans: [{ text: "ledger", tone: "link", width: 10 }, { text: "/home", tone: "muted" }], depth: 1 },
        { heading: "environment", note: "(2 vars)" },
        { table: [{ key: "VIVA_A", value: "1" }], depth: 1 },
        { table: [], depth: 1 },
      ],
    });
    specimen.expect(text.split("\n")).toEqual([
      "viva ledger/doctor",
      "  ledger     /home",
      "",
      "environment (2 vars)",
      "  key     value",
      "  VIVA_A  1    ",
    ]);
  });

  specimen.it("report: a block that is none of heading · table · spans throws naming the shapes", () => {
    specimen.expect(() => plain.report({ width: 80, blocks: [{ line: "x" }] })).toThrow(/heading · table · spans/);
    specimen.expect(() => shape({})).toThrow(/not a report block/);
  });

  specimen.it("listing: title, each group under a blank line, columns aligned, notes last", () => {
    specimen.expect(plain.listing(LISTING).split("\n")).toEqual([
      "viva",
      "",
      "instance",
      "  instance/create  [source] [target]  create an instance",
      "",
      "help",
      "  help             [filter]           every nature",
      "",
      "flags  --json  --verbose",
    ]);
  });

  specimen.it("listing: a long note wraps at the width with a hanging indent under the note column", () => {
    const text = plain.listing({
      title: "viva",
      groups: [{ title: "ledger", rows: [{ name: "ledger/init", usage: "[path]", note: "machine first-run — pick and persist the ledger home, scaffold every organ" }] }],
      notes: [],
      width: 60,
    });
    specimen.expect(text.split("\n")).toEqual([
      "viva",
      "",
      "ledger",
      "  ledger/init  [path]  machine first-run — pick and persist",
      "                       the ledger home, scaffold every organ",
    ]);
    specimen.expect(wrap("one two three", 7)).toEqual(["one two", "three"]);
    specimen.expect(wrap("supercalifragilistic word", 5)).toEqual(["supercalifragilistic", "word"]);
  });

  specimen.it("trace: a root titles its tree, its children are task rows — glyph by state, the last { done, total } as a bar, notes and faults under their row", () => {
    const records = [
      { span: 1, trace: null, path: "/m/install", verb: "open", at: 0 },
      { span: 2, trace: 1, path: "/m/install/symbol", verb: "open", at: 1 },
      { span: 2, trace: 1, path: "/m/install/symbol", verb: "note", at: 2, data: { done: 100, total: 242 } },
      { span: 2, trace: 1, path: "/m/install/symbol", verb: "note", at: 3, data: { done: 242, total: 242 } },
      { span: 2, trace: 1, path: "/m/install/symbol", verb: "close", at: 41 },
      { span: 3, trace: 1, path: "/m/install/literal", verb: "open", at: 42 },
      { span: 3, trace: 1, path: "/m/install/literal", verb: "note", at: 43, data: { folded: 2 } },
      { span: 3, trace: 1, path: "/m/install/literal", verb: "note", at: 44, data: { done: 100, total: 269 } },
      { span: 1, trace: null, path: "/m/install", verb: "fault", at: 90, data: { message: "disk full", code: null } },
      { span: 1, trace: null, path: "/m/install", verb: "close", at: 90 },
    ];
    specimen.expect(plain.trace({ records, width: 80 }).split("\n")).toEqual([
      "✕ /m/install  90ms",
      "  ✕ disk full",
      "  ✓ symbol   242/242  " + "━".repeat(20) + "  40ms",
      "  ◐ literal  100/269  " + "━".repeat(7) + "─".repeat(13),
      "    · folded 2",
    ]);
  });

  specimen.it("trace: a live Span's records fold the same way, an unsealed child reads running", () => {
    const install = new Span("install").open();
    install.branch("literal.symbols").open().note({ done: 269, total: 269 });
    const lines = plain.trace({ records: install.records, width: 80 }).split("\n");
    specimen.expect(lines[0].startsWith("◐ /install")).toBe(true);
    specimen.expect(lines[1]).toBe("  ◐ literal.symbols  269/269  " + "━".repeat(20));
  });

  specimen.it("an effect never prints as json in a pipe", () => {
    const text = plain.report({ width: 80, blocks: outline({ instance: "hello", stratum: "session" }) });
    specimen.expect(text.trimStart().startsWith("{")).toBe(false);
    specimen.expect(text).toContain("stratum");
  });
});
