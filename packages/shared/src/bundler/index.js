import { dirname, fromFileUrl, join, basename } from "$std/path/mod.ts";
import config from "@vivalence/config";
import svelte from "./bundlers/svelte.js";

const bundlers = { svelte };

function createBundler(bundleEntryPath, runtime, game) {
  const bundles = new Map();
  const BASE_URL = "bundle";

  const bundler = async (path) => {
    const type = path.split(".").pop();
    if ((type === "svelte" && config.isDev) || !bundles.has(path)) {
      const bundle = await bundlers[type](path);
      for (const { path, text } of bundle) {
        bundles.set(path, text);
      }
    }
    return bundles.get(path);
  };

  bundler.injectPath = () => async (ctx, next) => {
    const root = new URL(
      join("/r", runtime.manifest.slug, "/g", game.manifest.slug),
      config.env.get("DAEMON_URL"),
    ).toString();

    ctx.state.bundle = root + join("/", BASE_URL, basename(bundleEntryPath));

    await next();

    if (ctx.response.body && Array.isArray(ctx.response.body.data)) {
      ctx.response.body.data = ctx.response.body.data.map((item) => {
        item.bundle = ctx.state.bundle;
        return item;
      });
    } else if (ctx.response.body && typeof ctx.response.body.data === "object") {
      ctx.response.body.data.bundle = ctx.state.bundle;
    }
  };

  bundler.path = `/${BASE_URL}/:filename`;
  bundler.serve = () => async (ctx) => {
    const path = join(dirname(bundleEntryPath), ctx.params.filename);
    const bundle = await bundler(path);
    if (bundle) {
      const CACHE_AGE = config.env.get("CACHE_AGE_SECONDS");
      ctx.response.headers.set("Cache-Control", `max-age=${CACHE_AGE}`);
      ctx.response.headers.set("Expires", new Date(Date.now() + CACHE_AGE * 1000).toUTCString());
      ctx.response.body = bundle;
      ctx.response.type = "application/javascript";
    }
  };

  return bundler;
}

export default createBundler;
