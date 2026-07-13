import { App, v } from "@vivalence/typology";
import { RIDDLER_BUFFER_HISTORY } from "./types.js";

export { emitter } from "./emitter.js";
export { aperture } from "./aperture.js";

export const manifest = {
  type: "game",
  slug: "riddler",
  name: "Riddler",
  description:
    "Single-riddle challenges in the target language — weekdays, numbers, months, family.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "EXPOSED", "EMITTER"],
};

export const app = new App(
  "buffer/Riddler.svelte",
  v.buffer({
    data: {
      riddle: v.string(),
      answer: v.string(),
      hint: v.string().default(""),
      history: RIDDLER_BUFFER_HISTORY.default([]),
    },
    symbols: v.array(v.rel(v.symbol())),
    literals: v.array(v.rel(v.literal())),
  }),
);
