import fs from "@std/fs";
import { parse } from "@std/jsonc";

export default function read(config) {
  const createReader = (pathResolver) => async (path) => {
    const fullPath = pathResolver(path);
    const content = await Deno.readTextFile(fullPath);

    if (path.endsWith(".jsonc") || path.endsWith(".json")) {
      return parse(content);
    }
    return content;
  };

  config.read = {
    // file: async (path) => await Deno.readTextFile(path),
    file: createReader((p) => p),
    module: async (path) => {
      const mod = await import(path);
      return mod.default || mod;
    },
    repository: createReader(config.joins.repository),
    register: createReader(config.joins.register),

    config: {
      env: createReader(config.joins.config.env),
      system: createReader(config.joins.config.system),
      runtimes: createReader(config.joins.config.runtimes),
      services: createReader(config.joins.config.services),
    },

    data: {
      runtime: async (runtime, service = null, filename) => {
        const path = config.joins.data.runtime(runtime, service);
        return createReader(() => `${path}/${filename}`)(filename);
      },

      service: async (service, runtime = null, filename) => {
        const path = config.joins.data.service(service, runtime);
        return createReader(() => `${path}/${filename}`)(filename);
      },
    },
  };

  return config;
}
