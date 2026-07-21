import { App, v } from "@vivalence/typology";

export { harness } from "./harness.js";
export { emitter } from "./emitter.js";
export { generator } from "./generator.js";

export const manifest = {
  type: "chaosmonkey",
  slug: "reader",
  name: "Reader",
  description:
    "Conversational UI craftsman — describe any interface in chat and it is bundled live into your frame, then reshaped wish by wish.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "EMITTER", "HARNESSED", "GENERATIVE"],
};

export const app = new App("buffer/Reader.svelte", v.buffer({ data: {} }));
