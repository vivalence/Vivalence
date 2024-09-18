import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

async function boot(runtime, game) {
  const bundlePath = join(dirname(fromFileUrl(import.meta.url)), "/bundle/Translations.svelte");
  const bundle = bundler(bundlePath, runtime, game);
  runtime.router.get(bundle.path, bundle.serve());

  runtime.router.route("/provision", bundle.injectPath(), provision);

  runtime.router.route("/evaluate", evaluate);
  runtime.router.route("/status", (body, ctx) => ({ status: "OK" }));

  return runtime;
}

async function install(runtime, game) {
  await runtime.locals.supabase
    .from("Game")
    .update({
      mask: {
        prompt: {
          inner: `### Task:
Create simple sentence to practice.

### Instructions:
Choose common, everyday nouns suitable for beginner level language learners.
The statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.
`,
        },
      },
    })
    .eq("id", game.manifest.id);
}

export default {
  manifest: {
    type: "Game",
    slug: "translations",
    name: "Translations",
    version: "0.0.2",
    description: "Practice translating sentences",
    modules: {
      domain: "file://../../domain/domain.viva.js",
      ontology: "file://../../ontology/ontology.viva.js",
    },
  },
  boot,
  install,
};
