import { App, v } from "@vivalence/typology";
import * as types from "./types.js";

export { emitter } from "./emitter/index.js";
export { aperture } from "./aperture/index.js";
export { dataset } from "./dataset/index.js";
export { tools } from "./tools/index.js";

export const manifest = {
  type: "game",
  slug: "dojo",
  name: "Dojo",
  description:
    "One rep machine over words, sentences and conjugation forms — prompt, gameplay, preview, streak, continuous and limit all free to combine.",
  version: "0.1.0",
  traits: ["APPLICATION", "EMITTER", "INTENTED", "STANDALONE", "EXPOSED", "TOOLED"],
};

export const app = new App(
  "buffer/Dojo.svelte",
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
        set: types.set.optional(),
      },

      literals: v
        .array(v.rel(v.literal()))
        .desc(
          "The materialized set — data.set resolved into this buffer by an emitter or by /commission. Reviews land per literal; data.knowables carries authored pairs and resolved conjugation forms beside it.",
        ),

      symbols: v
        .array(v.rel(v.symbol()))
        .desc("Projection: every symbol the declared set mentions. Discoverability only — the clauses are the truth."),
    })
    .desc(
      `Dojo: one rep machine over knowables (words, sentences, conjugation forms), all axes free to combine.
The buffer IS the dojo: data.set declares the material (clauses: pick + repository query + cap, unioned in order), the axes say how it is played, literals + data.knowables are the materialization. Knowable carriers UNION: literals (corpus) + data.knowables (authored/generated/resolved conjugation forms).
Nothing plays until the declared set is materialized — by an emitter, an agent tool, or /commission — and the learner presses start.
Judging is automatic, never configured: FLIP -> self-grade, PICK -> identity, TYPE -> forgiving match unless the knowable is stamped judge LLM (then the /judge aperture grades it: MASTERY...FAILURE with NEUTRAL for acceptable alternatives).
Every attempt sends its review signal; streak accounting is session-local.
gameplay and recall accept a pool (array) — one value drawn per knowable.
Presets (meet, recognize, write, shadow, listen, drill, mixed, ultra) are emitter-side axis bundles — nothing in this buffer knows about them.
The buffer carries its own continuous machinery: data.continuous re-resolves data.set on completion, blacklisting what was played. Thread AIMED+QUEUEING re-pull on release is an alternative outer loop.`,
    ),
);
