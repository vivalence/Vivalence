import { cast, is } from "@vivalence/typology";
import * as jsonc from "@std/jsonc";
import { extract } from "@std/front-matter/yaml";
import { test as fronted } from "@std/front-matter/test";

export const read = (paladin) => {
  paladin.read = {
    text: async (path) => await Deno.readTextFile(path.absolute ?? path),

    bytes: async (path) => await Deno.readFile(path.absolute ?? path),

    json: async (path, fallback) => {
      try {
        return jsonc.parse(await Deno.readTextFile(path.absolute ?? path));
      } catch (error) {
        if (fallback !== undefined) return fallback;
        throw error;
      }
    },

    jsonl: async (path, fallback) => {
      try {
        const text = await Deno.readTextFile(path.absolute ?? path);
        return text.split("\n").filter(Boolean).map((entry) => JSON.parse(entry));
      } catch (error) {
        if (fallback !== undefined) return fallback;
        throw error;
      }
    },

    module: async (path) => {
      const file = path.absolute ?? path;
      return file.endsWith(".json") ? await paladin.read.json(path) : await import(file);
    },

    data: async (path) => {
      const module = await import(path.absolute ?? path);
      return module.default ?? module;
    },

    viva: async (path) => cast.viva(await paladin.read.module(path)),

    frontmatter: async (path) => {
      const text = await Deno.readTextFile(path.absolute ?? path);
      if (!fronted(text)) return { attrs: {}, body: text };
      const { attrs, body } = extract(text);
      return { attrs, body };
    },

    part: async (source, value, at) => {
      if (is.string(value) && value.startsWith("@")) return { module: value };
      const located = paladin.link.part(source, value, at);
      if (!located.path) return located.held;
      return await paladin.read.json(located.path).catch((error) => {
        const reason = error?.code === "ENOENT" ? "no such file" : error.message;
        const origin = source.absolute ?? source;
        throw new Error(`${origin} ${at}: "${value}" → ${located.path.absolute} — ${reason}`);
      });
    },
  };
};
