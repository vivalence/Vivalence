import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

const bundle = join(dirname(fromFileUrl(import.meta.url)), "/game/Conjugations.svelte");

async function install(runtime, Module) {
  const { error } = await runtime.locals.supabase
    .from("Game")
    .update({
      mask: {
        tags: {
          infinitive: { slug: "verbform:inf" },
        },
      },
    })
    .eq("id", Module.manifest.id);
  return !error;
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

export { manifest, provision, evaluate, bundle, install };
