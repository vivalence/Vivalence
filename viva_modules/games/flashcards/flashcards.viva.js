import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { bundler } from "@vivalence/shared/server";
import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision/index.js";

async function boot(runtime, game) {
  //   const entry = join(dirname(fromFileUrl(import.meta.url)), "./game/Flashcards.svelte");
  //   const bundle = await bundler.svelte(entry);
  //   runtime.router.get("/files/:file", async (ctx) => {const search = `/${ctx.params.file}`; const file = bundle.find(({ path }) => path.toLowerCase() === search.toLowerCase()); if (file) {ctx.response.body = file.text; ctx.response.type = "application/javascript";}});

  runtime.router.route("/provision/fromTagIds", provision.fromTagIds);
  runtime.router.route("/provision/fromUnitIds", provision.fromUnitIds);
  runtime.router.route("/provision/fromUnits", provision.fromUnits);
  runtime.router.route("/evaluate", evaluate);
  runtime.router.route("/status", (body, ctx) => ({ status: "ok" }));
  return runtime;
}

async function install(runtime, game) {
  await runtime.locals.supabase
    .from("Game")
    .update({
      mask: {
        back: "{{#back.header}}\n    <div class='header'>\n        {{{back.header}}}\n    </div>\n{{/back.header}}\n\n{{#back.content}}\n    <div class='content'>\n        {{{back.content}}}\n    </div>\n{{/back.content}}\n\n{{#back.footer}}\n    <div class='footer'>\n    {{{back.footer}}}\n    </div>\n{{/back.footer}}\n",
        front:
          "{{#front.header}}\n    <div class='header'>\n        {{{front.header}}}\n    </div>\n{{/front.header}}\n\n{{#front.content}}\n    <div class='content'>\n        {{{front.content}}}\n    </div>\n{{/front.content}}\n\n{{#front.footer}}\n    <div class='footer'>\n        {{{front.footer}}}\n    </div>\n{{/front.footer}}\n",
      },
    })
    .eq("id", game.manifest.id);
}

export default {
  manifest: {
    type: "Game",
    slug: "flashcards",
    name: "Flashcards",
    description: "Flashcards game for learning vocabulary",
    modules: {
      ontology: "file://../../ontology/ontology.viva.js",
    },
  },
  boot,
  install,
};
