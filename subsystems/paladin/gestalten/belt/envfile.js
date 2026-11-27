import fs from "fs-extra";
import { dirname } from "@std/path";

const MINTED = {
  SECRET_VIVA_JWT: () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24)))),
};

export const envfile = (paladin) => {
  paladin.envfile = {
    MINTED,

    fallback: (held) => held?.default ?? "",

    entry: (key, value) => (value == null || value === "" ? `# ${key}=""` : `${key}="${value}"`),

    write: async (path, bag) => {
      const file = path.absolute ?? path;
      await fs.ensureDir(dirname(file));
      let text = (await Deno.readTextFile(file).catch(() => null)) ?? "";
      for (const [key, value] of Object.entries(bag)) {
        const entry = paladin.envfile.entry(key, value);
        const set = `(?:export[ \\t]+)?${key}[ \\t]*=.*`;
        const unset = `#[ \\t]*${key}[ \\t]*=[ \\t]*(?:""|'')?[ \\t]*`;
        const held = new RegExp(`^[ \\t]*(?:${set}|${unset})$`, "m");
        const tail = text ? text.replace(/\n*$/, "\n") : "";
        text = held.test(text) ? text.replace(held, () => entry) : `${tail}${entry}\n`;
      }
      await Deno.writeTextFile(file, text);
      return text;
    },

    mint: (schema, bag = {}) =>
      Object.fromEntries(
        Object.entries(MINTED)
          .filter(([key]) => key in (schema.properties ?? {}) && !bag[key])
          .map(([key, make]) => [key, make()]),
      ),

    scaffold: (schema) => {
      const groups = Object.groupBy(
        Object.entries(schema.properties ?? {}),
        ([, held]) => held.group ?? "other",
      );
      return Object.entries(groups)
        .flatMap(([title, entries]) => [
          `## ${title}`,
          ...entries.flatMap(([key, held]) => [
            ...(held.description ? [`# ${held.description}`] : []),
            paladin.envfile.entry(key, paladin.envfile.fallback(held)),
          ]),
          "",
        ])
        .join("\n");
    },
  };
};
