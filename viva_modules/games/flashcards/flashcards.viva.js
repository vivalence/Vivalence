import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { bundler } from "@vivalence/shared/server";
import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision/index.js";

async function boot(runtime, locals, Module) {
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
};
