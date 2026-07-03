import { App, v } from "@vivalence/typology";

// the control case — no EMITTER, no HARNESSED. exists side-by-side with oracle
// to make the interaction demo legible by contrast: this mode does nothing.
export const manifest = {
  type: "chaosmonkey",
  slug: "bystander",
  name: "Bystander",
  description: "Baseline — no harness, no emitter. Contrast case for the oracle demo.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE"],
};

export const app = new App("buffer/Bystander.svelte", v.buffer({ data: {} }));
