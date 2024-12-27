import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision/index.js";
import { bundler } from "@vivalence/shared";

async function boot(runtime, Game) {
  const bundle = bundler({
    entry: join(dirname(fromFileUrl(import.meta.url)), "/game/game.svelte.js"),
    serve: runtime.manifest.url + Game.manifest.url,
  });

  runtime.router.get(bundle.url, bundle.serve());

  runtime.router.route("/provision/fromTagIds", bundle.injectBundleUrl(), provision.fromTagIds);
  runtime.router.route("/provision/fromUnitIds", bundle.injectBundleUrl(), provision.fromUnitIds);
  runtime.router.route("/provision/fromUnits", bundle.injectBundleUrl(), provision.fromUnits);
  runtime.router.route("/provision/fromLLM", bundle.injectBundleUrl(), provision.fromLLM);

  runtime.router.route("/evaluate", evaluate);

  return runtime;
}

const data = {
  mask: {
    // back: "{{#back.header}}\n    <div class='header'>\n        {{{back.header}}}\n    </div>\n{{/back.header}}\n\n{{#back.content}}\n    <div class='content'>\n        {{{back.content}}}\n    </div>\n{{/back.content}}\n\n{{#back.footer}}\n    <div class='footer'>\n    {{{back.footer}}}\n    </div>\n{{/back.footer}}\n",
    // front: "{{#front.header}}\n    <div class='header'>\n        {{{front.header}}}\n    </div>\n{{/front.header}}\n\n{{#front.content}}\n    <div class='content'>\n        {{{front.content}}}\n    </div>\n{{/front.content}}\n\n{{#front.footer}}\n    <div class='footer'>\n        {{{front.footer}}}\n    </div>\n{{/front.footer}}\n",
  },
};

const manifest = {
  type: "game",
  slug: "flashcards",
  name: "Flashcards",
  description: "Flashcards game for learning vocabulary",
  version: "0.0.1",
};
export { manifest, data, boot };
