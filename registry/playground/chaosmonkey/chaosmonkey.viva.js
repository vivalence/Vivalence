import { App, v } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "chaosmonkey",
  name: "Chaosmonkey",
  description: "Harness testbed — where tooling and conversation interactions get developed.",
  version: "0.1.0",
  traits: ["APPLICATION"],
};

export const app = new App("buffer/Chaosmonkey.svelte", v.buffer({ data: {} }));
