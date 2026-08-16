import { App, v } from "@vivalence/typology";

export { harness } from "./harness.js";
export { tools } from "./tools/index.js";
export { aperture } from "./aperture.js";
export { emitter } from "./emitter.js";

export const manifest = {
  type: "srs",
  slug: "memoriter",
  name: "Memoriter",
  description: "Spaced-repetition flashcards on SM-2: review at the tablet or in conversation with the Magister.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "EMITTER", "EXPOSED", "HARNESSED", "CONVERSATIONAL", "TOOLED"],
};

export const app = new App(
  "buffer/Memoriter.svelte",
  v.buffer({
    data: { status: v.record(v.string(), v.string()).default({}) },
    literals: v.array(v.rel(v.literal())),
  }),
);
