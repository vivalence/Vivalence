import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

const bundle = join(dirname(fromFileUrl(import.meta.url)), "/game/Conjugations.svelte");

const data = {
  mask: {
    tags: {
      infinitive: { slug: "verbform:inf" },
    },
  },
};

const manifest = {
  type: "game",
  slug: "conjugations",
  name: "Conjugations",
  description: "Practice conjugating 6 verbs at a time in different tenses and moods.",
  version: "0.0.1",
};

export { manifest, provision, evaluate, bundle, data };
