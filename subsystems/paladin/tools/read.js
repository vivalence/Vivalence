import { is, cast, Path } from "@vivalence/typology";
import { parse } from "@std/jsonc";

export default function read(config) {
  const resolve = (path) => path?.absolute || path;

  const readers = {
    text: async (path) => {
      const resolved = resolve(path);
      return await Deno.readTextFile(resolved);
    },

    json: async (path) => {
      const resolved = resolve(path);
      const content = await Deno.readTextFile(resolved);
      return parse(content);
    },

    module: async (path) => {
      const resolved = resolve(path);
      const module = await import(resolved);
      return module;
    },
    viva: async (path) => {
      const module = await import(resolve(path));
      // check.module(module)?.throw()

      // if (module.manifest?.traits?.includes("VIEWABLE")) {
      //   if (module.view instanceof Path)
      //     module.view = new Path(dirname(path.absolute)).branch(
      //       module.view.value,
      //     );
      //   else if (is.string(module.view))
      //     module.view = new Path(dirname(path.absolute)).branch(module.view);
      //   else
      //     console.warn(
      //       "@registry: imported viewable module missing .view.entry",
      //     );
      //   console.log("MODULE VIEQ");
      //   console.log(module.view.absolute);
      //   console.log(module.view.down().value);
      // }

      return module;
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
