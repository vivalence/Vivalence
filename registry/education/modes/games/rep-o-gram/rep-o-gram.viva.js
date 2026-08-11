import { App, v } from "@vivalence/typology";
import * as types from "./types.js";

export { emitter } from "./emitter/index.js";
export { aperture } from "./aperture/index.js";
export { dataset } from "./dataset/index.js";
export { tools } from "./tools/index.js";

export const manifest = {
  type: "game",
  slug: "rep-o-gram",
  name: "Rep-O-Gram",
  description:
    "One rep machine over words, sentences and conjugation forms — prompt, gameplay, preview, streak, continuous and limit all free to combine.",
  version: "0.1.0",
  traits: ["APPLICATION", "EMITTER", "INTENTED", "STANDALONE", "EXPOSED", "TOOLED"],
};

export const app = new App(
  "buffer/RepOGram.svelte",
  v
    .buffer({
      data: {
        recall: types.recall,
        gameplay: types.gameplay.default(types.DEFAULTS.gameplay),
        prompt: types.prompt.default(types.DEFAULTS.prompt),
        preview: types.preview,
        streak: types.streak,
        continuous: types.continuous,
        limit: types.limit,
        forgiving: types.forgiving.default(types.DEFAULTS.forgiving),
        target: types.target,
        knowables: types.knowables,
      },

      literals: v
        .array(v.rel(v.literal()))
        .desc(
          "Corpus carrier. When populated it IS the rep set (data.knowables ignored); reviews land per literal.",
        ),

      symbols: v
        .array(v.rel(v.symbol()))
        .desc(
          "Symbol scope this set was drawn from (/symbols route). Display + continuous re-pull requery the same subset.",
        ),
    })
    .desc(
      `Rep-o-gram: one rep machine over knowables (words, sentences, conjugation forms), all axes free to combine.
Knowable carriers, in precedence: literals (corpus) > data.knowables (direct/generated).
Judging is automatic, never configured: FLIP -> self-grade, PICK -> identity, TYPE -> forgiving match unless the knowable is stamped judge LLM (then the /judge aperture grades it: MASTERY...FAILURE with NEUTRAL for acceptable alternatives).
Every attempt sends its review signal; streak accounting is session-local.
Presets (write, shadow, listen, flashcard, pick, conjugate, translate) are emitter-side axis bundles — nothing in this buffer knows about them.
The buffer carries its own continuous machinery: data.continuous refetches fresh sets on completion (symbols scope requeried when present). Thread AIMED+QUEUEING re-pull on release is an alternative outer loop.`,
    ),
);
