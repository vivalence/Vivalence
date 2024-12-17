import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

const bundle = join(dirname(fromFileUrl(import.meta.url)), "/game/game.svelte.js");

const data = {
  mask: {
    goal: `### Task:
Create simple sentence to practice.

### Instructions:
Choose common, everyday nouns suitable for beginner level language learners.
The statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.
`,
  },
};

const manifest = {
  type: "game",
  slug: "translations",
  name: "Translations",
  version: "0.0.3",
  description: "Practice translating sentences",
};

export { manifest, provision, evaluate, bundle, data };
