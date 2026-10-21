import { mime, v } from "@vivalence/typology";

export { harness, primer } from "./harness.js";
export { tools } from "./tools/index.js";
export { aperture } from "./aperture.js";
export { emitter } from "./emitter.js";

export const manifest = {
  type: "srs",
  slug: "memo",
  name: "Memo",
  description: "Spaced-repetition flashcards on SM-2: drill in the frame (tab reveals, 1 again · 2 hard · 3 good · 4 easy) or in conversation with the Magister; both grade one schedule.",
  version: "0.1.0",
  traits: ["VIEWABLE", "EMITTER", "EXPOSED", "HARNESSED", "CONVERSATIONAL", "TOOLING", "PRIMER"],
};

export const buffer = v.buffer({
  data: {
    deck: v.array(v.object({}, { additionalProperties: true })).optional(),
    language: v.object({ known: v.string(), learning: v.string() }).optional(),
    dealt: v.string().optional(),
  },
  literals: v.array(v.rel(v.literal())),
});

export const views = [
  { slug: "memo", mount: "buffer/memo.jsx", mime: mime.tty.solid },
  { slug: "memo", mount: "buffer/Memo.svelte", mime: mime.dom.svelte },
];
