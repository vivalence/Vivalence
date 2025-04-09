import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { bundler } from "@vivalence/shared";
import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision/index.js";

async function boot(runtime, game) {
  const bundle = bundler({
    entry: join(dirname(fromFileUrl(import.meta.url)), "/game/game.svelte.js"),
    serve: game.entity.url.pathname,
  });

  runtime.aperture.router.get(bundle.url, bundle.serve());

  runtime.aperture
    .branch("/provision")
    .use(bundle.injectBundleUrl())
    .open("/fromTagIds", provision.fromTagIds)
    .open("/fromUnitIds", provision.fromUnitIds)
    .open("/fromUnits", provision.fromUnits)
    .open("/fromLLM", provision.fromLLM);

  runtime.aperture.open("/evaluate", evaluate);

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
export { boot, data, manifest };
