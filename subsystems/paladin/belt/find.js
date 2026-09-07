import fs from "@std/fs";
import { extname, join, relative } from "@std/path";
import { Path } from "@vivalence/typology";
import { skip } from "./ignore.js";

export default function find(config) {
  const search = async function* (pattern, skipped, dir, depth) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (skipped(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (depth > 0) yield* search(pattern, skipped, path, depth - 1);
      } else if (entry.name.match(pattern)) {
        yield path;
      }
    }
  };

  const collect = async (generator) => {
    const files = [];
    for await (const file of generator) {
      files.push(file);
    }
    return files.map((f) => new Path(f));
  };

  const walk = (pattern, ignore) => async (path, depth = Infinity) => {
    const dir = path.absolute || path;
    const exp = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    return await collect(search(exp, skip(ignore), dir, depth));
  };

  const describe = async (root, path) => {
    const stat = await Deno.stat(join(root, path)).catch(() => null);
    if (!stat?.isFile) return null;
    return { path, format: extname(path).slice(1).toLowerCase(), bytes: stat.size, mtime: stat.mtime?.toISOString() ?? null };
  };

  const index = async (root, ignore) => {
    const files = await walk(/./, ignore)(root);
    const described = await Promise.all(files.map((file) => describe(root, relative(root, file.absolute))));
    return described.filter(Boolean).sort((a, b) => (a.path < b.path ? -1 : 1));
  };

  const readMany = (reader) => (paths) => Promise.all(paths.map(reader)); //map cast path

  const viva = walk(/\.(viva.js|viva.ts|viva.md|viva.org)$/);

  const DATA = /\.(jsonc?|jsonl|js|ts|mjs)$/;

  const data = async (path, depth = Infinity) => {
    const files = (await walk(DATA)(path, depth))
      .filter((file) => file.filename !== "index.js")
      .sort((a, b) => (a.absolute < b.absolute ? -1 : 1));
    const rows = await Promise.all(
      files.map((file) =>
        /\.jsonl$/.test(file.absolute)
          ? config.read.jsonl(file)
          : /\.jsonc?$/.test(file.absolute)
            ? config.read.json(file)
            : config.read.data(file)
      ),
    );
    return rows.flat();
  };

  // find + read + filter by manifest type — modules carry their source path
  const type = async (path, type, depth = Infinity) => {
    const sources = await viva(path, depth);
    const modules = await Promise.all(
      sources.map((source) => config.read.viva(source).then((module) => ({ ...module, source }))),
    );
    return modules.filter((module) => module.manifest?.type === type);
  };

  config.find = {
    viva,
    walk,
    data,
    describe,
    index,
    skip,
    json: walk(/\.(jsonc?|json)$/),
    read: readMany(config.read.file),
    type,
  };
}
