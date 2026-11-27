import fs from "fs-extra";
import { extname, join, relative } from "@std/path";
import { is, Path, Vector } from "@vivalence/typology";
import { skip } from "./ignore.js";

const DIALECTS = [
  [
    (attrs) => is.string(attrs.description),
    (attrs) => ({ valence: attrs.description, load: "lazy" }),
  ],
  [() => true, (attrs) => attrs],
];

export const find = (paladin) => {
  paladin.find = {
    skip,

    walk: (pattern, ignore) => async (path, depth = Infinity) => {
      const wanted = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      const skipped = skip(ignore);
      const search = async (directory, left) => {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        const found = await Promise.all(
          entries
            .filter((entry) => !skipped(entry.name))
            .map(async (entry) => {
              const file = join(directory, entry.name);
              if (entry.isDirectory()) return left > 0 ? await search(file, left - 1) : [];
              return entry.name.match(wanted) ? [file] : [];
            }),
        );
        return found.flat();
      };
      return (await search(path.absolute || path, depth)).map((file) => new Path(file));
    },

    describe: async (root, path) => {
      const stat = await Deno.stat(join(root, path)).catch(() => null);
      if (!stat?.isFile) return null;
      return {
        path,
        format: extname(path).slice(1).toLowerCase(),
        bytes: stat.size,
        mtime: stat.mtime?.toISOString() ?? null,
      };
    },

    index: async (root, ignore) => {
      const files = await paladin.find.walk(/./, ignore)(root);
      const described = await Promise.all(
        files.map((file) => paladin.find.describe(root, relative(root, file.absolute))),
      );
      return described.filter(Boolean).sort((a, b) => (a.path < b.path ? -1 : 1));
    },

    viva: (path, depth) =>
      paladin.find.walk(/\.(viva.js|viva.ts|viva.md|viva.org|viva.jsonc?)$/)(path, depth),

    json: (path, depth) => paladin.find.walk(/\.(jsonc?|json)$/)(path, depth),

    recipe: (home) => {
      const found = ["instance.viva.jsonc", "instance.viva.json"]
        .map((name) => join(home.absolute, name))
        .find(fs.existsSync);
      return found ? new Path(found) : null;
    },

    data: async (path, depth = Infinity) => {
      const files = (await paladin.find.walk(/\.(jsonc?|jsonl|js|ts|mjs)$/)(path, depth))
        .filter((file) => file.filename !== "index.js")
        .sort((a, b) => (a.absolute < b.absolute ? -1 : 1));
      const held = await Promise.all(
        files.map((file) =>
          /\.jsonl$/.test(file.absolute)
            ? paladin.read.jsonl(file)
            : /\.jsonc?$/.test(file.absolute)
              ? paladin.read.json(file)
              : paladin.read.data(file),
        ),
      );
      return held.flat();
    },

    modules: async (path, type, depth = Infinity) => {
      const sources = await paladin.find.viva(path, depth);
      const modules = await Promise.all(
        sources.map(async (source) => ({ ...(await paladin.read.viva(source)), source })),
      );
      return modules.filter((module) => module.manifest?.type === type);
    },

    primer: async (path) => {
      const primer = new Vector();
      const files = (await paladin.find.walk(/\.md$/)(path)).sort((a, b) =>
        a.absolute < b.absolute ? -1 : 1,
      );
      for (const file of files) {
        const { attrs } = await paladin.read.frontmatter(file);
        const nature = file.absolute.slice(path.absolute.length + 1).replace(/\.md$/, "");
        const sniffed = DIALECTS.find(([test]) => test(attrs))[1](attrs);
        primer.open(
          { ...sniffed, nature },
          async () => (await paladin.read.frontmatter(file)).body,
        );
      }
      return primer;
    },
  };
};
