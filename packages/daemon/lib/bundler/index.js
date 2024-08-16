import config from "@vivalence/config";
import svelte from "./bundlers/svelte.js";

const bundlers = { svelte };

function createBundler() {
  const bundles = new Map();

  const bundle = async (path) => {
    const type = path.split(".").pop();
    if ((type === "svelte" && config.isDev) || !bundles.has(path)) {
      const bundle = await bundlers[type](path);
      for (const { path, text } of bundle) {
        bundles.set(path, text);
      }
    }
    return bundles.get(path);
  };

  return bundle;
}

export default createBundler;
