import config from "@vivalence/config";
import { walk } from "@std/fs";
import { obj } from "../lib/index.js";
import { RuntimeEntity } from "@vivalence/schema";

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
      if (!RuntimeModule?.manifest) throw new Error(`Invalid module structure at ${entry.path}`);
      if (RuntimeModule.manifest.type !== "runtime") continue;
      RuntimeModule.Entity = RuntimeEntity;
      // ensure(RuntimeModule)
      runtimes[RuntimeModule.manifest.slug] = RuntimeModule.default ?? RuntimeModule;
    } catch (e) {
      console.error("[@shared RUNTIME loadFromRepo] error");
      console.error(e);
    }
  }

  return runtimes;
}

export default { loadFromRepo };
