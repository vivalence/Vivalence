import * as kit from "../index.js";
import { outline, plain } from "../plain.js";
import { specimen } from "@vivalence/typology";
import { tokens } from "@vivalence/dapper";
import { screen, settle, SPLIT, THEMES } from "./world.js";

const BLOCKS = [
  { heading: "viva ledger/doctor" },
  { spans: [{ text: "✓", tone: "positive" }, { text: "ledger", tone: "strong", width: 12 }, { text: "/home/viva", tone: "muted" }], depth: 1 },
  { heading: "environment", note: "(1 vars · session › ledger)" },
  { table: [{ key: "VIVA_LEDGER_MOUNT", stratum: "ledger", value: "/home/viva" }], depth: 1 },
];

const LISTING = {
  title: "viva",
  groups: [{ title: "registry", rows: [{ name: "registry/tap", usage: "[location]", note: "tap a package" }] }],
  notes: ["viva help <prefix> narrows"],
};

const cut = async (kind, props, theme = "northsea") => {
  const setup = await screen(SPLIT);
  kit.cut(setup.renderer, { ...props, width: 80 }, kit.kinds[kind], tokens(theme, "1"));
  await settle(setup);
  const text = setup.externalOutput.takeText();
  setup.renderer.destroy();
  return text;
};

const trimmed = (text) => text.split("\n").map((line) => line.trimEnd());

specimen.describe("kinds — the view kinds a caller names by data", () => {
  specimen.it("report · listing · confirm · form · picker · pending", () => {
    specimen.expect(Object.keys(kit.kinds)).toEqual(["report", "listing", "confirm", "form", "picker", "pending"]);
  });
});

specimen.describe("Report — blocks cut into scrollback", () => {
  specimen.it("paints what plain prints, line for line", async () => {
    const text = await cut("report", { blocks: BLOCKS });
    specimen.expect(trimmed(text)).toEqual(trimmed(plain.report({ blocks: BLOCKS, width: 80 })));
  });

  specimen.it("an outlined effect paints its keys and its table", async () => {
    const text = await cut("report", { blocks: outline({ instance: "hello", ports: [{ name: "runtime", port: 2501 }, { name: "anima", port: 1794 }] }) });
    specimen.expect(text).toContain("instance");
    specimen.expect(text).toContain("hello");
    specimen.expect(text).toContain("runtime  2501");
  });

  for (const theme of THEMES) {
    specimen.it(`every tone resolves in ${theme}`, async () => {
      const spans = Object.keys(kit.TONES).map((name) => ({ text: name, tone: name }));
      specimen.expect(await cut("report", { blocks: [{ spans, depth: 0 }] }, theme)).toContain("primary positive");
    });
  }

  specimen.it("a span with an unknown tone throws at paint", async () => {
    const setup = await screen(SPLIT);
    specimen.expect(() => kit.cut(setup.renderer, { blocks: [{ spans: [{ text: "x", tone: "loud" }], depth: 0 }], width: 80 }, kit.Report, tokens("northsea", "1"))).toThrow(/not a tone/);
    setup.renderer.destroy();
  });

  specimen.it("held, it stays live until enter acknowledges it", async () => {
    const setup = await screen(SPLIT);
    const held = kit.captured(setup.renderer, { blocks: BLOCKS, width: 80 }, kit.Report, tokens("northsea", "1"));
    await settle(setup);
    specimen.expect(setup.captureCharFrame()).toContain("viva ledger/doctor");
    setup.mockInput.pressEnter();
    specimen.expect(await held.released).toBe(true);
    await settle(setup);
    specimen.expect(setup.externalOutput.takeText()).toContain("VIVA_LEDGER_MOUNT");
    setup.renderer.destroy();
  });
});

specimen.describe("Table — inferred columns, shrunk to width", () => {
  specimen.it("a muted head over the rows, indented by depth", async () => {
    const text = await cut("report", { blocks: [{ table: [{ slug: "alpha", port: 2501 }, { slug: "beta", port: 2502 }], depth: 2 }] });
    specimen.expect(trimmed(text)).toEqual(["    slug   port", "    alpha  2501", "    beta   2502"]);
  });

  specimen.it("no rows paint nothing", async () => {
    const text = await cut("report", { blocks: [{ heading: "empty" }, { table: [], depth: 1 }] });
    specimen.expect(trimmed(text)).toEqual(["empty"]);
  });
});

specimen.describe("Listing — groups of name · usage · note", () => {
  specimen.it("paints what plain prints, line for line", async () => {
    const text = await cut("listing", LISTING);
    specimen.expect(trimmed(text)).toEqual(trimmed(plain.listing({ ...LISTING, width: 80 })));
    specimen.expect(text).toContain("registry/tap");
  });
});
