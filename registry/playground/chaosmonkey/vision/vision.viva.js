import { App, v } from "@vivalence/typology";

export const manifest = {
  type: "chaosmonkey",
  slug: "vision",
  name: "Vision",
  description: "Baseline — no harness, no emitter. Contrast case for the oracle demo.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE"],
};

export const app = new App("Vision.svelte", v.buffer({ data: {} }));
