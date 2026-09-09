import { App, Vector } from "@vivalence/typology";
import { doctor, research, web } from "./tools/index.js";

export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: [
    "HARNESSED",      // mode has access to the daemon's harness
    "CONVERSATIONAL", // mode can be chatted with
    "TOOLED",         // mode provides agentic tools

    "EMITTER",        // mode renders ad-hoc buffers
    "APPLICATION",    // buffers from static svelte
    "GENERATIVE",     // buffers hallucinated at runtime

    "EXPOSED",        // mode serves http endpoints
    "STANDALONE",     // mode is an entrypoint on the client
  ],
};

export const tools = new Vector()
  .slurp(doctor)
  .slurp(web)
  .slurp(research);

export const app = new App("./app/App.svelte");

export { aperture } from "./aperture.js";
export { harness } from "./harness.js";
export { emitter, generator } from "./page/index.js";
