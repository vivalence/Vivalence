import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

async function boot(runtime, game) {
  const bundlePath = join(dirname(fromFileUrl(import.meta.url)), "/game/Conjugations.svelte");
  const bundle = bundler(bundlePath, runtime, game);

  runtime.router.get(bundle.path, bundle.serve());
  runtime.router.route("/provision", bundle.injectPath(), provision);
  runtime.router.route("/evaluate", evaluate);

  runtime.router.route("/status", (body, ctx) => ({ status: "ok" }));

  return runtime;
}

async function install(runtime, game) {}

export default {
  manifest: {
    type: "Game",
    slug: "translations",
    name: "Translations",
    description: "Practice translating sentences",
    modules: {
      domain: "file://../../domain/domain.viva.js",
      ontology: "file://../../ontology/ontology.viva.js",
    },
  },
  boot,
  install,
};
