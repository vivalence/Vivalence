import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

const bundle = join(dirname(fromFileUrl(import.meta.url)), "/bundle/Translations.svelte");

async function install(runtime, game) {
  const installation = await runtime.locals.supabase
    .from("Game")
    .update({
      mask: {
        prompt: {
          goal: `### Task:
Create simple sentence to practice.

### Instructions:
Choose common, everyday nouns suitable for beginner level language learners.
The statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.
`,
        },
      },
    })
    .eq("id", game.manifest.id);
  return !installation.error;
}

const manifest = {
  type: "Game",
  slug: "translations",
  name: "Translations",
  version: "0.0.2",
  description: "Practice translating sentences",
};

export { manifest, provision, evaluate, bundle, install };
