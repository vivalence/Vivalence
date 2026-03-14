import { is, cast, Path } from "@vivalence/typology";
import * as jsonc from "@std/jsonc";

export default function read(config) {
  const resolve = (path) => {
    // console.log("resolved:", path);
    return path?.absolute || path;
  };

  const readers = {
    text: async (path) => {
      const resolved = resolve(path);
      return await Deno.readTextFile(resolved);
    },

    json: async (path) => {
      const resolved = resolve(path);
      const content = await Deno.readTextFile(resolved);
      return jsonc.parse(content);
    },

    module: async (path) => {
      const module = await import(resolve(path));
      return module;
    },

    viva: async (path) => {
      // todo assert .viva.js path
      const cake = await import(resolve(path));
      const viva = cast.viva(cake); // cast.cake()
      return viva;
    },
  };

  const readFile = async (path) => {
    const resolved = resolve(path);

    if (resolved.match(/\.(viva.js|viva.org|viva.svelte)$/)) {
      return await readers.viva(path);
    }
    if (resolved.match(/\.(jsonc?|json)$/)) {
      return await readers.json(path);
    }

    if (resolved.match(/\.(js|ts|mjs|jsx|tsx)$/)) {
      return await readers.module(path);
    }

    return await readers.text(path);
  };

  config.read = {
    file: readFile,
    text: readers.text,
    viva: readers.viva,
    json: readers.json,
    module: readers.module,
  };
}
