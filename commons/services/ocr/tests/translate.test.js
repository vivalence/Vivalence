import { specimen } from "@vivalence/typology";
import { translate } from "../provider/index.js";
import { Block } from "../schematics.js";

const { describe, it, expect } = specimen;

const fixture = (name) => Deno.readTextFile(new URL(`./fixtures/${name}`, import.meta.url));

describe("ocr translate — one tesseract page into blocks", () => {
  it("a page of one word is one block carrying that word, its page and its box", async () => {
    expect(translate(await fixture("one-word.tsv"), 1)).toEqual([
      {
        text: "Tides",
        words: [{ word: "Tides", confidence: 0.97, page: 1, box: [0.1033, 0.37, 0.31, 0.28] }],
      },
    ]);
  });

  it("a tsv that comes without its heading, as the wasm engine's does, reads the same", async () => {
    const [, ...records] = (await fixture("one-word.tsv")).split("\n");
    expect(translate(records.join("\n"), 1)).toEqual(translate(await fixture("one-word.tsv"), 1));
    expect(translate(records.join("\n"), 1)[0].text).toBe("Tides");
  });

  it("every paragraph is its own block, in the engine's order", async () => {
    const blocks = translate(await fixture("two-column.tsv"), 1);
    expect(blocks.map((block) => block.text)).toEqual([
      "Tide Tables",
      "The tide rises twice Fig. 3. A tide gauge a day at Brest. read in 1907.",
    ]);
  });

  it("a ruled table's rules come as blank words, the last one too, and the page still reads", async () => {
    const blocks = translate(await fixture("ruled-table.tsv"), 1);
    expect(blocks.map((block) => block.text).join(" ")).toContain("Saint-Malo 07:48 14:05 11.4");
    expect(blocks.flatMap((block) => block.words).every((word) => word.word.trim() !== "")).toBe(true);
  });

  it("a word the margin broke is one word in the text, still two on the page", async () => {
    const [held] = translate(await fixture("split-paragraph.tsv"), 1);
    expect(held.text).toContain("properties that are common to all semiconductors");
    expect(held.words.map((word) => word.word)).toContain("com-");
  });

  it("the page handed in is the page every word stands on", async () => {
    const blocks = translate(await fixture("two-column.tsv"), 7);
    expect(new Set(blocks.flatMap((block) => block.words.map((word) => word.page)))).toEqual(new Set([7]));
  });

  it("a block passes the service's own schematic", async () => {
    for (const block of translate(await fixture("two-column.tsv"), 1)) {
      expect(Block.faults(block)).toEqual([]);
    }
  });

  it("the blocks join into the page's text, every word keeping its box", async () => {
    const blocks = translate(await fixture("two-column.tsv"), 1);
    expect(blocks.map((block) => block.text).join(" ")).toBe("Tide Tables The tide rises twice Fig. 3. A tide gauge a day at Brest. read in 1907.");
    expect(blocks[0].words[0].box).toEqual([0.0344, 0.1462, 0.0622, 0.0846]);
  });
});
