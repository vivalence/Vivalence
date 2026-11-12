import { specimen } from "@vivalence/typology";
import { bitmap, level, pack, skew, tilted, unpack } from "../provider/level.js";

const { describe, it, expect } = specimen;

const scan = async () => unpack(await Deno.readFile(new URL("./fixtures/skewed-scan.pgm", import.meta.url)));

describe("ocr level — a skewed page is turned upright before the engine reads it", () => {
  it("a scan skewed 3 degrees measures 3", async () => {
    expect(skew(await scan())).toBe(3);
  });

  it("levelled, the same scan measures 0", async () => {
    const gray = await scan();
    expect(skew(level(gray, skew(gray)))).toBe(0);
  });

  it("a pixmap unpacks and packs back into its own bytes", async () => {
    const pixmap = await Deno.readFile(new URL("./fixtures/skewed-scan.pgm", import.meta.url));
    expect(pack(unpack(pixmap))).toEqual(pixmap);
  });

  it("a box read on the levelled page lands back on the given one", () => {
    expect(tilted({ wide: 1000, tall: 1000 }, 90)([0.7, 0.45, 0.1, 0.1])).toEqual([0.45, 0.7, 0.1, 0.1]);
    expect(tilted({ wide: 278, tall: 388 }, 0)([0.1, 0.2, 0.3, 0.4])).toEqual([0.1, 0.2, 0.3, 0.4]);
  });

  it("the source is not mutated", async () => {
    const gray = await scan();
    const before = gray.shades.slice();
    level(gray, 3);
    expect(gray.shades).toEqual(before);
  });

  it("a bmp's rows come top down, its ink where the engine found the word", async () => {
    const gray = bitmap(await Deno.readFile(new URL("./fixtures/one-word.bmp", import.meta.url)));
    const [, , , , , , left, top, wide, tall] = (await Deno.readTextFile(new URL("./fixtures/one-word.tsv", import.meta.url)))
      .split("\n")
      .map((record) => record.split("\t"))
      .find(([level]) => level === "5")
      .map(Number);
    const inked = [...gray.shades.keys()].filter((index) => gray.shades[index] < 128);
    expect([gray.wide, gray.tall]).toEqual([300, 100]);
    expect(inked.length).toBeGreaterThan(0);
    expect(inked.every((index) => index % gray.wide >= left && index % gray.wide <= left + wide)).toBe(true);
    expect(inked.every((index) => index / gray.wide >= top && index / gray.wide <= top + tall)).toBe(true);
  });
});
