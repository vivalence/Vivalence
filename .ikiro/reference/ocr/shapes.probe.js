// limit: 3000 chars
// run from the repo root:
// deno run -A --no-check --config deno.jsonc .ikiro/reference/ocr/shapes.probe.js .ikiro/reference/ocr/one-word.tsv
import { v } from "@vivalence/typology";

const tsv = (await Deno.readTextFile(Deno.args[0])).trim().split("\n").slice(1).map((held) => held.split("\t"));
const at = (level) => tsv.filter((cells) => cells[0] === String(level));
const box = (cells) => [Number(cells[6]), Number(cells[7]), Number(cells[8]), Number(cells[9])];
const [sheet] = at(1);
const [region] = at(2);
const [token] = at(5);
const confidence = Math.round(Number(token[10])) / 100;

const Box = v.array(v.integer(), { minItems: 4, maxItems: 4 }).desc("Pixels: left, top, width, height. Example: [30, 36, 100, 30]");
const Confidence = v.number({ minimum: 0, maximum: 1 }).desc("The engine's own certainty. Example: 0.96");
const Number1 = v.integer({ minimum: 1 }).desc("The page, counted from 1. Example: 1");

const A = v.object({
  pages: v.array(v.object({
    number: Number1,
    width: v.integer(),
    height: v.integer(),
    blocks: v.array(v.object({
      box: Box,
      words: v.array(v.object({ text: v.string(), box: Box, confidence: Confidence })),
    })),
  })),
});

const B = v.object({
  blocks: v.array(v.object({
    kind: v.enum(["heading", "paragraph", "table", "figure", "note"]),
    text: v.string(),
    page: Number1,
  })),
});

const Segment = v.array(v.integer({ minimum: 0 }), { minItems: 2, maxItems: 2 }).desc("Offsets into text, end exclusive. Example: [0, 5]");
const C = v.object({
  text: v.string(),
  pages: v.array(v.object({
    number: Number1,
    width: v.integer(),
    height: v.integer(),
    words: v.array(v.object({ segment: Segment, box: Box, confidence: Confidence })),
  })),
  blocks: v.array(v.object({
    role: v.enum(["heading", "paragraph", "table", "figure", "note"]),
    segments: v.array(Segment),
    regions: v.array(v.object({ page: Number1, box: Box })),
  })),
});

const values = {
  A: { pages: [{ number: 1, width: box(sheet)[2], height: box(sheet)[3], blocks: [{ box: box(region), words: [{ text: token[11], box: box(token), confidence }] }] }] },
  B: { blocks: [{ kind: "heading", text: token[11], page: 1 }] },
  C: {
    text: token[11],
    pages: [{ number: 1, width: box(sheet)[2], height: box(sheet)[3], words: [{ segment: [0, token[11].length], box: box(token), confidence }] }],
    blocks: [{ role: "heading", segments: [[0, token[11].length]], regions: [{ page: 1, box: box(region) }] }],
  },
};

for (const [name, schema] of Object.entries({ A, B, C })) {
  const errors = [...schema.errors(schema.cast(values[name]))];
  console.log(`---- ${name} errors=${errors.length}`);
  console.log(JSON.stringify(values[name], null, 2));
}
