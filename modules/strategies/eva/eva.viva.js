import { dirname, fromFileUrl, join } from "$std/path/mod.ts";
import { bundler } from "@vivalence/shared";
import aperture from "./aperture/index.js";

const bundleRoot = dirname(fromFileUrl(import.meta.url));
const bundlePath = join(bundleRoot, "./buffer/buffer.svelte.js");

async function boot(runtime, strategy) {
  const bundle = bundler(bundlePath);
  bundle.url = bundle.absoluteUrl(strategy.aperture.path);
  bundle.path = bundlePath;
  strategy.bundle = bundle;

  runtime.aperture.use(async (ctx, next) => {
    ctx.state.strategy = strategy;
    return await next();
  });
  runtime.aperture.router.get(bundle.get, bundle.serve);
  runtime.aperture
    .open("/session/init", aperture.init)
    .open("/agent", aperture.agent);
  runtime.aperture.open("/status", () => ({ status: "ok" }));
}

const manifest = {
  type: "strategy",
  slug: "eva",
  name: "Eva",
  version: "0.0.1",
  description: "Virtual Assistant",
  traits: ["VIEWABLE", "AGENTIC"],
};

export { manifest, boot };
