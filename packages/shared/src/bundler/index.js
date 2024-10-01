import { dirname, fromFileUrl, join, basename } from "$std/path/mod.ts";
import config from "@vivalence/config";
import svelte from "./bundlers/svelte.js";

const bundlers = { svelte };

function createBundler(input) {
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

  bundler.injectBundleUrl = () => async (ctx, next) => {
    const rootpath = new URL(input.url, config.env.get("DAEMON_URL")).toString();
    const bundlepath = join("/", BASE_URL, basename(input.path));
    ctx.state.game.bundle = rootpath + bundlepath;
    await next();
  };

  bundler.url = `/${BASE_URL}/:filename`;
  bundler.serve = () => async (ctx) => {
    const path = join(dirname(input.path), ctx.params.filename);
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
