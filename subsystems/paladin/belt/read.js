import { cast } from "@vivalence/typology";
import * as jsonc from "@std/jsonc";

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

    module: async (path) => await import(resolve(path)),

    viva: async (path) => {
      const cake = await import(resolve(path));
      return cast.viva(cake);
    },
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
  };
}
