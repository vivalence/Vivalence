import { basename, fromFileUrl, dirname, join } from "$std/path/mod.ts";
import config from "@vivalence/config";
import bundlers from "./bundlers/index.js";

function makeBundler(entry) {
  const bundles = new Map();

  const bundler = async (path) => {
    const type = path.includes(".svelte") ? "svelte" : path.split(".").pop();
    if (config.isDev || !bundles.has(path)) {
      const bundle = await bundlers[type](path);
      for (const { path, text } of bundle) {
        bundles.set(path, text);
      }
    }
    return bundles.get(path);
  };

  const BUNDLE_BASE_URL = "bundle";
  bundler.get = `/${BUNDLE_BASE_URL}/:filename`;
  bundler.path = entry;

  bundler.absoluteUrl = (basePath) => {
    const url = new URL(
      join(
        config.env.get("VIVA_DAEMON_URL"),
        basePath.ancestor.toString(),
        basePath.toString(),
        BUNDLE_BASE_URL,
        basename(entry),
      ),
    );

    bundler.url = url;

    return url;
  };

  bundler.middleware = async (ctx, next) => {
    if (!bundler.url)
      throw new Error("Bundler middleware requires absoluteUrl");

    ctx.state.bundle = {
      type: "game",
      url: ctx.game.bundle.url.href,
      game: { slug: ctx.game.manifest.slug },
    };

    await next();

    if (ctx.response.body) {
      if (Array.isArray(ctx.response.body)) {
        ctx.response.body.forEach((body) => {
          body.bundle = ctx.state.bundle;
        });
      } else {
        ctx.response.body.bundle = ctx.state.bundle;
      }
    }
  };

  bundler.serve = async (ctx) => {
    const path = join(dirname(entry), ctx.params.filename);
    const bundle = await bundler(path);
    if (bundle) {
      // if (!config.isDev) {const CACHE_AGE = config.env.get("CACHE_AGE_SECONDS"); ctx.response.headers.set("Cache-Control", `max-age=${CACHE_AGE}`); ctx.response.headers.set("Expires", new Date(Date.now() + CACHE_AGE * 1000).toUTCString());}
      ctx.response.body = bundle;
      ctx.response.type = "application/javascript";
    } else {
      throw new Error("Bundler Error", path);
    }
  };

  return bundler;
}

makeBundler.makePath = (root, bundle) => {
  return fromFileUrl(new URL(bundle, root));
};

export default makeBundler;
