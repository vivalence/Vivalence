import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import { bundler } from "@vivalence/shared";

// import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

async function boot(runtime, Game) {
  const bundlePath = join(dirname(fromFileUrl(import.meta.url)), "/bundle/Prose.svelte");
  const gameUrl = join("/r", runtime.manifest.slug, "/g", Game.manifest.slug);
  const bundle = bundler(bundlePath, gameUrl);

  runtime.router.get(bundle.path, bundle.serve());
  runtime.router.route("/provision", bundle.injectBundleUrl(), provision);

  // runtime.router.route("/evaluate", evaluate);
  runtime.router.route("/status", (body, ctx) => ({ status: "OK" }));

  return runtime;
}

const manifest = {
  type: "Game",
  slug: "prose",
  name: "Prose",
  version: "0.0.0",
  description: "Display a textblock",
};
export { manifest, boot };
