import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

async function boot(runtime, Module) {
  const bundlePath = join(dirname(fromFileUrl(import.meta.url)), "/game/Conjugations.svelte");
  const gameUrl = join("/r", runtime.manifest.slug, "/g", Module.manifest.slug);
  const bundle = bundler(bundlePath, gameUrl);

  runtime.router.get(bundle.path, bundle.serve());
  runtime.router.route("/provision", bundle.injectBundleUrl(), provision);
  runtime.router.route("/evaluate", evaluate);
  runtime.router.route("/status", (body, ctx) => ({ status: "ok" }));

  return runtime;
}

async function install(runtime, Module) {
  return await runtime.locals.supabase
    .from("Game")
    .update({
      mask: {
        tags: {
          infinitive: { slug: "verbform:inf" },
        },
      },
    })
    .eq("id", Module.manifest.id);
}

const manifest = {
  type: "Game",
  slug: "conjugations",
  name: "Conjugations",
  description: "Practice conjugating 6 verbs at a time in different tenses and moods.",
  version: "0.0.0",
  modules: {
    domain: "file://../../domain/domain.viva.js",
    ontology: "file://../../ontologies/langugage-universal-dependencies/ontology.viva.js",
  },
};
export { manifest, boot, install };
