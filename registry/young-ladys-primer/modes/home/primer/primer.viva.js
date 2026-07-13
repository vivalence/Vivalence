import { App, v } from "@vivalence/typology";
import { PRIMER_HISTORY, SCENE } from "./types.js";
import { aperture } from "./aperture.js";
import { harness } from "./harness.js";

export const manifest = {
  type: "homepage",
  slug: "primer",
  name: "The Illustrated Primer",
  description:
    "A living storybook that raises a child through an ever-branching tale, teaching each concept the moment its story is ready to be told.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "HARNESSED", "EXPOSED"],
};

export const app = new App(
  "buffer/Primer.svelte",
  v.buffer({
    data: {
      history: PRIMER_HISTORY.default([]),
      scene: SCENE.optional(),
      concept: v.string().optional(),
      progress: v.object({ mastered: v.integer(), total: v.integer() }).optional(),
    },
  }),
);

export { aperture, harness };
