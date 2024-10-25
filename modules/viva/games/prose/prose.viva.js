import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

const bundle = join(dirname(fromFileUrl(import.meta.url)), "/bundle/Prose.svelte");

const manifest = {
  type: "game",
  slug: "prose",
  name: "Prose",
  version: "0.0.0",
  description: "Display a textblock",
};

export { manifest, bundle, provision, evaluate };
