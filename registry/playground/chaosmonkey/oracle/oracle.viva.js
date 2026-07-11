import { App, Vector, v } from "@vivalence/typology";
export { aperture } from "./aperture.js";
export { emitter } from "./emitter.js";
export { harness } from "./harness.js";

export const manifest = {
  type: "chaosmonkey",
  slug: "oracle",
  name: "Oracle",
  description: "Aperture calls harness.object.render — the chaosmonkey demo case.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "HARNESSED", "EXPOSED", "EMITTER", "CONVERSATIONAL"],
};

// the hub is a control surface — its buffer carries nothing. Turn persistence
// for the /ask round-trip is registered manually below, daemon-side — the
// demo case for a server-mediated interaction.
export const app = new App("buffer/Oracle.svelte", v.buffer({ data: {} }));

const COMPACT_THRESHOLD = 10;
const COMPACT_KEEP = 4;
