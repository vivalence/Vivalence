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
      innerPrompt: {
        text: "### Task:\nCreate simple statements to practice the usage of present tense verbs with a noun for A1 language learners.\nUsage of present tense verbs and nouns on A1 level.\n1 VERB + 1 NOUN\n\n### Examples:\nHe eats bread. - Él come pan. (Masculine Singular)\nShe reads a book. - Ella lee un libro. (Feminine Singular)\nThey play soccer. - Ellos juegan fútbol. (Masculine Plural)\n\n### Instructions:\nThe sentence should be made up of 2 parts. One (1) verb in the present tense and one (1) noun.\nChoose common, everyday nouns suitable for A1 level language learners.\nThe statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.\nI will provide the verb. Take the provided verb exactly. Don't change its tense or person.",
      },
    })
    .eq("id", game.manifest.id);
}

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
