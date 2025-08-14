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

  bundler.path = entry;
  bundler.entry = basename(entry);

  // bundler.get = `/:filename`;
  // bundler.absoluteUrl = (basePath) => {console.log("@bundler outdated absoluteUrl()", basename(entry)); const url = new URL(join(config.env.get("VIVA_DAEMON_URL"), basePath.ancestor.toString(), basePath.toString(), basename(entry),),); bundler.url = url; return url;};

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

  bundler.serve = async (filename) => {
    const path = join(dirname(entry), filename);
    const bundle = await bundler(path);

    if (bundle) return bundle;
    throw new Error("Bundler Error", path);
  };

  return bundler;
}

makeBundler.middleware = (bundle) => {
  return bundle.middleware;
  // return fromFileUrl(new URL(bundle, root));
};
makeBundler.makePath = (root, bundle) => {
  return fromFileUrl(new URL(bundle, root));
};

export default makeBundler;
