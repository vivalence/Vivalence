import fs from "@std/fs";
import { dirname } from "@std/path";

export default function state(paladin) {
  const resolve = (path) => (typeof path === "function" ? path() : path?.absolute ?? path);
  const parent = (file) => fs.ensureDir(dirname(file));

  paladin.state = {
    dir: (path) => fs.ensureDir(resolve(path)),
    text: async (path, text) => {
      const file = resolve(path);
      await parent(file);
      await Deno.writeTextFile(file, text);
    },
    json: async (path, data) => {
      const file = resolve(path);
      await parent(file);
      await Deno.writeTextFile(file, JSON.stringify(data, null, 2));
    },
    jsonl: async (path, entry) => {
      const file = resolve(path);
      await parent(file);
      await Deno.writeTextFile(file, JSON.stringify(entry) + "\n", { append: true });
    },
    remove: (path) => Deno.remove(resolve(path)).catch(() => {}),
    scribe: async (path, text) => {
      const file = resolve(path);
      await parent(file);
      if ((await Deno.readTextFile(file).catch(() => null)) === text) return false;
      await Deno.writeTextFile(`${file}.tmp`, text);
      await Deno.rename(`${file}.tmp`, file);
      return true;
    },
    store: async (path, bytes) => {
      const file = resolve(path);
      await parent(file);
      const held = await Deno.readFile(file).catch(() => null);
      if (held && held.length === bytes.length && held.every((byte, i) => byte === bytes[i])) return false;
      await Deno.writeFile(`${file}.tmp`, bytes);
      await Deno.rename(`${file}.tmp`, file);
      return true;
    },
    open: async (path) => {
      const file = resolve(path);
      await parent(file);
      return Deno.open(file, { write: true, create: true, append: true });
    },
  };
}
