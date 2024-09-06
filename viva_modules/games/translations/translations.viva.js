import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import lib from "@vivalence/shared";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

async function boot(runtime, game) {
  const bundleEntryPath = join(
    dirname(fromFileUrl(import.meta.url)),
    "/bundle/Translations.svelte",
  );
  // const bundlePath = join(dirname(fromFileUrl(import.meta.url)), "bundle");

  const bundler = lib.bundler(bundleEntryPath, runtime, game);
  runtime.router.get(bundler.path, bundler.serve());
  runtime.router.route("/provision", bundler.injectPath(), provision);

  // runtime.router.use(async (ctx, next) => {const root = join("/r", runtime.manifest.slug, "/g", game.manifest.slug); ctx.state.bundle = config.env.get("DAEMON_URL") + join(root, BUNDLE_PATH, GAME_COMPONENT); console.log("ctx.state.bundle", ctx.state.bundle); await next(); if (ctx.response.body && Array.isArray(ctx.response.body.data)) {ctx.response.body.data = ctx.response.body.data.map((item) => {if (item && item.type && item.type === "TRANSLATIONS") item.bundle = ctx.state.bundle; return item;});} else if (ctx.response.body && typeof ctx.response.body.data === "object") {if (ctx.response.body.data.type === "TRANSLATIONS") ctx.response.body.data.bundle = ctx.state.bundle;}});
  // runtime.router.get(`/${BUNDLE_PATH}/:filename`, async (ctx) => {const path = join(dirname(fromFileUrl(import.meta.url)), BUNDLE_PATH, ctx.params.filename); const bundle = await ctx.runtime.locals.bundler(path); if (bundle) {ctx.response.headers.set("Cache-Control", `max-age=${CACHE_AGE}`); ctx.response.headers.set("Expires", new Date(Date.now() + CACHE_AGE * 1000).toUTCString()); ctx.response.body = bundle; ctx.response.type = "application/javascript";}});

  runtime.router.route("/evaluate", evaluate);
  runtime.router.route("/status", (body, ctx) => ({ status: "ok" }));

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
  },
  boot,
  install,
};
