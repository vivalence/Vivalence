import fs from "@std/fs";
import { join } from "@std/path";
import { Path } from "@vivalence/typology";

export default function find(config) {
  const search = async function* (pattern, dir, depth) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "bak" || entry.name === "archive" || entry.name === "slp") continue;
        if (depth > 0) yield* search(pattern, path, depth - 1);
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

  const walk = (pattern) => async (path, depth = Infinity) => {
    const dir = path.absolute || path;
    const exp = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    return await collect(search(exp, dir, depth));
  };

  const readMany = (reader) => (paths) => Promise.all(paths.map(reader)); //map cast path

  const viva = walk(/\.(viva.js|viva.ts|viva.md|viva.org)$/);

  // find + read + filter by manifest type — cakes carry their source path
  const type = async (path, type, depth = Infinity) => {
    const sources = await viva(path, depth);
    const cakes = await Promise.all(
      sources.map((source) => config.read.viva(source).then((cake) => ({ ...cake, source }))),
    );
    return cakes.filter((cake) => cake.manifest?.type === type);
  };

  config.find = {
    viva,
    json: walk(/\.(jsonc?|json)$/),
    read: readMany(config.read.file),
    type,
  };
}
