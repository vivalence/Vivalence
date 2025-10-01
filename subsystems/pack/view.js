import { join } from "$std/path/mod.ts";
import { Path } from "@vivalence/typology";
import config from "@vivalence/config";
import bundlers from "./svelte.js";

const root = config.repository.path.absolute;

const importmap = {
  imports: {
    "@vivalence/vector": join(root, "subsystems/vector/mod.js"),
    "@vivalence/shared": join(root, "subsystems/shared/client.js"),
    "@vivalence/typology": join(root, "subsystems/typology/client.js"),
    "@vivalence/surface": join(root, "systems/surfaces/html/surface.viva.js"),
    // "@vivalence/vendor": join(root, "subsystems/vendor/client.js"),
    // "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"),
  },
};

export class View {
  bundles = [];
  constructor(path, url) {
    this.url = new URL(url.href + path.value);
    this.path = path;
    (async () => await this.bundle())();
  }
  async bundle() {
    // console.log("view.bundle:", this.path.absolute);
    if (config.is.dev) this.bundles = [];
    if (!this.bundles[0])
      this.bundles = await bundlers.svelte(
        this.path.absolute,
        importmap,
        config.is.dev,
      );
  }

  serve(branch) {
    const path = this.path.ancestor.branch(branch);
    const bundle = this.bundles.find((bundle) => bundle.path === path.absolute);
    return {
      text: bundle.text,
      response: {
        type: "application/javascript",
        body: bundle.text,
      },
    };
  }
}

// function makeBundler(entry) {
//   const bundles = new Map();

//   const bundler = async (path) => {
//     const type = path.includes(".svelte") ? "svelte" : path.split(".").pop();
//   };

//   bundler.path = entry;
//   bundler.entry = basename(entry);
//   // bundler.get = `/:filename`;
//   // bundler.absoluteUrl = (basePath) => {console.log("@bundler outdated absoluteUrl()", basename(entry)); const url = new URL(join(config.env.get("VIVA_DAEMON_URL"), basePath.ancestor.toString(), basePath.toString(), basename(entry),),); bundler.url = url; return url;};

//   bundler.middleware = async (ctx, next) => {
//     if (!bundler.url)
//       throw new Error("Bundler middleware requires absoluteUrl");

//     ctx.state.bundle = {
//       type: "game",
//       url: ctx.game.bundle.url.href,
//       game: { slug: ctx.game.manifest.slug },
//     };

//     await next();

//     if (ctx.response.body) {
//       if (Array.isArray(ctx.response.body)) {
//         ctx.response.body.forEach((body) => {
//           body.bundle = ctx.state.bundle;
//         });
//       } else {
//         ctx.response.body.bundle = ctx.state.bundle;
//       }
//     }
//   };

//   bundler.serve = async (filename) => {
//     const path = join(dirname(entry), filename);
//     const bundle = await bundler(path);

//     if (bundle) return bundle;
//     throw new Error("Bundler Error", path);
//   };

//   return bundler;
// }

// makeBundler.middleware = (bundle) => {
//   return bundle.middleware;
//   // return fromFileUrl(new URL(bundle, root));
// };
// makeBundler.makePath = (root, bundle) => {
//   return fromFileUrl(new URL(bundle, root));
// };
