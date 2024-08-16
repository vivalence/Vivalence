import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import config from "@vivalence/config";

import evaluate from "./methods/evaluate.js";
import provision from "./methods/provision.js";

const BUNDLE_PATH = "game";
const GAME_COMPONENT = "Conjugations.svelte";
const CACHE_AGE = config.env.get("CACHE_AGE_SECONDS");

async function boot(runtime, game) {
  runtime.router.use(async (ctx, next) => {
    const rootPath = join(config.env.get("DAEMON_URL"), "/r", runtime.manifest.slug, "/g");
    ctx.state.bundle = join(rootPath, game.manifest.slug, BUNDLE_PATH, GAME_COMPONENT);

    await next();

    if (ctx.response.body && Array.isArray(ctx.response.body.data)) {
      ctx.response.body.data = ctx.response.body.data.map((item) => {
        if (item.type && item.type === "CONJUGATIONS") item.bundle = ctx.state.bundle;
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

  runtime.router.route("/provision", provision);
  runtime.router.route("/evaluate", evaluate);

  runtime.router.route("/status", (body, ctx) => ({ status: "ok" }));

  return runtime;
}

async function install(runtime, game) {}

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

// import Router from "@koa/router";

// import generate from "./api/generate";
// import evaluate from "./api/evaluate";

// const router = new Router();

// // @lj: future
// // import Component from "./ui/Conjugations.svelte"; router.get("/ui/:filename", async (ctx) => {const fullPath = path.join(__dirname, "ui", ctx.params.filename); console.log("Serving file:", fullPath); try {const fileContent = fs.readFileSync(fullPath, "utf-8"); ctx.body = fileContent; ctx.type = "application/javascript";} catch (err) {ctx.status = 404; ctx.body = "File not found";}});

// router.post("/generate", async (ctx, next) => {
//   const inputs = ctx.request.body;
//   const result = await generate(inputs, ctx.locals);
//   ctx.body = { data: result };
// });

// router.post("/evaluate", async (ctx, next) => {
//   const inputs = ctx.request.body;
//   const result = await evaluate(inputs, ctx.locals);
//   ctx.body = { data: result };
// });

// export default router;
