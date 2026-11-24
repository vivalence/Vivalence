import fs from "fs-extra";
import { dirname, join, parse, relative } from "@std/path";
import { crypto as streaming } from "@std/crypto";
import { encodeHex } from "@std/hex";
import { mime } from "@vivalence/typology";

export const write = (paladin) => {
  paladin.write = {
    dir: (path) => fs.ensureDir(path.absolute ?? path),

    text: async (path, text) => {
      const file = path.absolute ?? path;
      await fs.ensureDir(dirname(file));
      if ((await Deno.readTextFile(file).catch(() => null)) === text) return false;
      await Deno.writeTextFile(`${file}.tmp`, text);
      await Deno.rename(`${file}.tmp`, file);
      return true;
    },

    bytes: async (path, bytes) => {
      const file = path.absolute ?? path;
      await fs.ensureDir(dirname(file));
      const held = await Deno.readFile(file).catch(() => null);
      const same = held?.length === bytes.length && held.every((byte, at) => byte === bytes[at]);
      if (same) return false;
      await Deno.writeFile(`${file}.tmp`, bytes);
      await Deno.rename(`${file}.tmp`, file);
      return true;
    },

    json: async (path, data) => {
      const file = path.absolute ?? path;
      await fs.ensureDir(dirname(file));
      await Deno.writeTextFile(file, JSON.stringify(data, null, 2));
    },

    jsonl: async (path, entry) => {
      const file = path.absolute ?? path;
      await fs.ensureDir(dirname(file));
      await Deno.writeTextFile(file, JSON.stringify(entry) + "\n", { append: true });
    },

    open: async (path) => {
      const file = path.absolute ?? path;
      await fs.ensureDir(dirname(file));
      return Deno.open(file, { write: true, create: true, append: true });
    },

    stream: async (path, dropped, body) => {
      const root = path.absolute ?? path;
      const seat = parse(dropped.path);
      const folder = join(root, seat.dir);
      if (relative(root, folder).startsWith("..")) {
        throw new Error(`[write] '${dropped.path}' leaves ${root}`);
      }
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
        const digest = await streaming.subtle.digest("SHA-256", body.pipeThrough(writing));
        const hash = encodeHex(digest);
        const { size } = await Deno.stat(partial);
        const name = `${seat.name}.${hash.slice(0, 8)}.${mime.extension(dropped.mime)}`;
        const mount = join(folder, name);
        if (!(await fs.pathExists(mount))) await Deno.rename(partial, mount);
        return { path: relative(root, mount), mount, mime: dropped.mime, hash, bytes: size };
      } finally {
        sink.close();
        await paladin.remove.file(partial);
      }
    },
  };
};
