import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

async function boot(runtime, Game) {
  const bundlePath = join(dirname(fromFileUrl(import.meta.url)), "/bundle/Translations.svelte");
  const gameUrl = join("/r", runtime.manifest.slug, "/g", Game.manifest.slug);
  const bundle = bundler(bundlePath, gameUrl);

  runtime.router.get(bundle.path, bundle.serve());
  runtime.router.route("/provision", bundle.injectBundleUrl(), provision);

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

const manifest = {
  type: "Game",
  slug: "translations",
  name: "Translations",
  version: "0.0.2",
  description: "Practice translating sentences",
};
export { manifest, boot, install };
