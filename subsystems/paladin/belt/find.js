import fs from "@std/fs";
import { join } from "@std/path";
import { Path } from "@vivalence/typology";

export default function find(config) {
  const search = async function* (pattern, dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        yield* search(pattern, path);
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

  const walk = (pattern) => async (path) => {
    const dir = path.absolute || path;
    const exp = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    return await collect(search(exp, dir));
  };

  const readMany = (reader) => (paths) => Promise.all(paths.map(reader)); //map cast path

  config.find = {
    viva: walk(/\.(viva.js|viva.org|viva.svelte)$/),
    json: walk(/\.(jsonc?|json)$/),
    read: readMany(config.read.file),
  };
}
