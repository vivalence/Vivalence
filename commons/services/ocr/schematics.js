import { v } from "@vivalence/typology";

const { Part } = v.primitives.hallucination;

export const Source = v
  .union([Part.Document, Part.Image])
  .desc('A scan, base64: a pdf, or one page as an image. Example: { type: "image", mime: "image/png", data: "iVBORw0KGgo=" }');

export const Settings = v.object(
  {
    language: v.string().optional().desc('The engine\'s language codes, joined by +. Example: "eng+ita"'),
    density: v.integer({ minimum: 72 }).optional().desc("Dots per inch a pdf page is drawn at before it is read. Example: 300"),
  },
  { additionalProperties: true },
);

export const Word = v.object({
  word: v.string().desc('One word as the engine read it, a hyphen the margin broke kept. Example: "Tides"'),
  confidence: v.number().optional().desc("How sure the engine is of it. Example: 0.97"),
  page: v.integer({ minimum: 1 }).optional().desc("The page it stands on, counted from 1. Example: 1"),
  box: v
    .array(v.number({ minimum: 0, maximum: 1 }), { minItems: 4, maxItems: 4 })
    .optional()
    .desc("Where on the page, as fractions of it: left, top, width, height. Example: [0.1033, 0.37, 0.31, 0.28]"),
});

export const Block = v.object({
  text: v.string().desc('One paragraph, its words sewn in the engine\'s order. Example: "Tide Tables"'),
  words: v.array(Word),
});
