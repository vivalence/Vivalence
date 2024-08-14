import config from "@vivalence/config";
import { bundler } from "@vivalence/shared/server";

function createBundler() {
  const bundles = new Map();

  const bundle = async (path) => {
    const type = path.split(".").pop();
    if ((type === "svelte" && config.isDev) || !bundles.has(path)) {
      const bundle = await bundler[type](path);
      for (const { path, text } of bundle) {
        bundles.set(path, text);
      }
    }
    return bundles.get(path);
  };

  return bundle;
}

export default createBundler;
