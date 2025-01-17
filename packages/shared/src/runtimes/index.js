import config from "@vivalence/config";
import { walk } from "@std/fs";
import { obj } from "../lib/index.js";

async function loadFromRepo() {
  const runtimes = {};

  for await (const entry of walk(config.env.get("VIVA_RUNTIMES_DIR"), {
    maxDepth: 3,
    includeFiles: true,
    includeDirs: false,
    match: [/\.viva\.js$/],
  })) {
    try {
      const RuntimeModule = obj.deepClone(await import(entry.path));
      runtimes[RuntimeModule.manifest.slug] = RuntimeModule;
    } catch (e) {
      console.error("[@shared RUNTIME loadFromRepo] error");
      console.error(e);
    }
  }

  return runtimes;
}

export default { loadFromRepo };
