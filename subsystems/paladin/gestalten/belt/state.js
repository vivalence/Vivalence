import fs from "fs-extra";
import { dirname, join, parse, relative } from "@std/path";
import { crypto as streaming } from "@std/crypto";
import { encodeHex } from "@std/hex";
import { mime } from "@vivalence/typology";

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
    line: (key, value) => (value == null || value === "" ? `# ${key}=""` : `${key}="${value}"`),
    // upsert by LINE: a .env is authored, so its comments and ordering are content.
    env: async (path, bag) => {
      const file = resolve(path);
      await parent(file);
      let text = (await Deno.readTextFile(file).catch(() => null)) ?? "";
      for (const [key, value] of Object.entries(bag)) {
        const line = paladin.state.line(key, value);
        const held = new RegExp(
          `^[ \\t]*(?:(?:export[ \\t]+)?${key}[ \\t]*=.*|#[ \\t]*${key}[ \\t]*=[ \\t]*(?:""|'')?[ \\t]*)$`,
          "m",
        );
        const tail = text ? text.replace(/\n*$/, "\n") : "";
        text = held.test(text) ? text.replace(held, () => line) : `${tail}${line}\n`;
      }
      await Deno.writeTextFile(file, text);
      return text;
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
    land: async (path, dropped, body) => {
      const root = resolve(path);
      const seat = parse(dropped.path);
      const folder = join(root, seat.dir);
      if (relative(root, folder).startsWith("..")) throw new Error(`[state] '${dropped.path}' leaves ${root}`);
      await fs.ensureDir(folder);
      const partial = join(folder, `.${crypto.randomUUID()}.partial`);
      const sink = await Deno.open(partial, { create: true, write: true });
      try {
        const writing = new TransformStream({
          async transform(chunk, controller) {
            await sink.write(chunk);
            controller.enqueue(chunk);
          },
        });
        const hash = encodeHex(await streaming.subtle.digest("SHA-256", body.pipeThrough(writing)));
        const { size } = await Deno.stat(partial);
        const mount = join(folder, `${seat.name}.${hash.slice(0, 8)}.${mime.extension(dropped.mime)}`);
        if (!(await fs.pathExists(mount))) await Deno.rename(partial, mount);
        return { path: relative(root, mount), mount, mime: dropped.mime, hash, bytes: size };
      } finally {
        sink.close();
        await paladin.state.remove(partial);
      }
    },
    open: async (path) => {
      const file = resolve(path);
      await parent(file);
      return Deno.open(file, { write: true, create: true, append: true });
    },
  };
}
