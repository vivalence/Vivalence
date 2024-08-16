import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision/index.js";

const BUNDLE_PATH = "game";
const GAME_COMPONENT = "Flashcards.svelte";
const CACHE_AGE = config.env.get("CACHE_AGE_SECONDS");

async function boot(runtime, game) {
  runtime.router.use(async (ctx, next) => {
    const rootPath = join(config.env.get("DAEMON_URL"), "/r", runtime.manifest.slug, "/g");
    ctx.state.bundle = join(rootPath, game.manifest.slug, BUNDLE_PATH, GAME_COMPONENT);

    await next();

    if (ctx.response.body && Array.isArray(ctx.response.body.data)) {
      ctx.response.body.data = ctx.response.body.data.map((item) => {
        if (item.type && item.type === "FLASHCARDS") item.bundle = ctx.state.bundle;
        return item;
      });
    }
  });
  runtime.router.get(`/${BUNDLE_PATH}/:filename`, async (ctx) => {
    const path = join(dirname(fromFileUrl(import.meta.url)), BUNDLE_PATH, ctx.params.filename);
    const bundle = await ctx.runtime.locals.bundler(path);
    if (bundle) {
      ctx.response.headers.set("Cache-Control", `max-age=${CACHE_AGE}`);
      ctx.response.headers.set("Expires", new Date(Date.now() + CACHE_AGE * 1000).toUTCString());
      ctx.response.body = bundle;
      ctx.response.type = "application/javascript";
    }
  });

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
  },
  boot,
  install,
};
