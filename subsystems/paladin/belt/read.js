import { cast, is, Path } from "@vivalence/typology";
import { dirname, isAbsolute, resolve as absolute } from "@std/path";
import * as jsonc from "@std/jsonc";

const CONTENT = /^\s*[[{]/;

export default function read(paladin) {
  const resolve = (path) => path?.absolute || path;

  const readers = {
    text: async (path) => await Deno.readTextFile(resolve(path)),

    json: async (path, fallback) => {
      try {
        return jsonc.parse(await Deno.readTextFile(resolve(path)));
      } catch (error) {
        if (fallback !== undefined) return fallback;
        throw error;
      }
    },

    jsonl: async (path, fallback) => {
      try {
        const text = await Deno.readTextFile(resolve(path));
        return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
      } catch (error) {
        if (fallback !== undefined) return fallback;
        throw error;
      }
    },

    module: async (path) => (resolve(path).endsWith(".json") ? await readers.json(path) : await import(resolve(path))),

    data: async (path) => {
      const module = await import(resolve(path));
      return module.default ?? module;
    },

    viva: async (path) => cast.viva(await readers.module(path)),
  };

  const locate = (source, value, at) => {
    const origin = resolve(source);
    if (!is.string(value)) return { held: value, from: origin };
    const record = [];
    const spoken = paladin.expand(value, record, at);
    const unset = record.flatMap((row) => row.unset);
    if (unset.length) throw new Error(`${origin} ${at}: ${unset.join(" ")} unset — "${value}" names no file and no content`);
    if (CONTENT.test(spoken)) return { held: jsonc.parse(spoken), from: value };
    return { path: new Path(isAbsolute(spoken) ? spoken : absolute(dirname(origin), spoken)), from: value };
  };

  const part = async (source, value, at) => {
    const located = locate(source, value, at);
    if (!located.path) return located.held;
    return await paladin.read.json(located.path).catch((error) => {
      throw new Error(`${resolve(source)} ${at}: "${value}" → ${located.path.absolute} — ${error?.code === "ENOENT" ? "no such file" : error.message}`);
    });
  };

  const readFile = async (path) => {
    const resolved = resolve(path);
    if (resolved.match(/\.(viva.js|viva.org|viva.svelte)$/)) return await readers.viva(path);
    if (resolved.match(/\.jsonl$/)) return await readers.jsonl(path);
    if (resolved.match(/\.(jsonc?|json)$/)) return await readers.json(path);
    if (resolved.match(/\.(js|ts|mjs|jsx|tsx)$/)) return await readers.module(path);
    return await readers.text(path);
  };

  paladin.read = {
    file: readFile,
    text: readers.text,
    viva: readers.viva,
    json: readers.json,
    jsonl: readers.jsonl,
    module: readers.module,
    data: readers.data,
    locate,
    part,
  };
}
