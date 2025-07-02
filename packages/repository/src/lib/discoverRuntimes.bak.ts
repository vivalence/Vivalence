import { walk } from "@std/fs";
import { obj } from "@vivalence/shared";
import { Daemon, Runtime, Module } from "@vivalence/types";

import config from "@vivalence/config";

export default async function loadFromRepo() {
  const Runtimes = [];

  const entries = walk(config.env.get("VIVA_RUNTIMES_DIR"), {
    maxDepth: 4,
    includeFiles: true,
    includeDirs: false,
    match: [/\.viva\.js$/],
  });

  for await (const entry of entries) {
    const RuntimeModule = obj.deepClone(await import(entry.path));
    if (!RuntimeModule?.manifest)
      throw new Error(`Invalid module structure at ${entry.path}`);
    if (RuntimeModule.manifest.type !== "runtime") continue;
    Runtimes.push(RuntimeModule.default ?? RuntimeModule);
  }

  return Runtimes;
}
