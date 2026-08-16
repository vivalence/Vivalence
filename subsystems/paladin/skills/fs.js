import { join } from "@std/path";
import { v, Vector } from "@vivalence/typology";

const SKIP = new Set(["bak", "archive", "slp", "node_modules", ".git"]);
const READ_CAP = 16_000;
const LIST_CAP = 200;

const resolve = (root, path = ".") => {
  const base = root.endsWith("/") ? root : `${root}/`;
  const full = new URL(path.replace(/^\/+/, ""), `file://${base}`).pathname;
  if (full !== root && `${full}/` !== base && !full.startsWith(base)) {
    throw new Error(`path '${path}' escapes the root — paths are relative to ${root}`);
  }
  return full;
};

const entries = async (dir) => {
  const collected = [];
  for await (const entry of Deno.readDir(dir)) collected.push(entry);
  return collected.sort((a, b) =>
    a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1
  );
};

export const fs = new Vector()
  .open(
    {
      nature: "/fs/tree",
      valence:
        "The directory tree under a path, relative to this mode's root. Ground here before " +
        'reading. Example: { path: "dataset", depth: 2 }.',
      input: v.object({
        path: v.string().default("."),
        depth: v.integer({ minimum: 1, maximum: 5 }).default(2),
      }),
    },
    async (ctx) => {
      const lines = [];
      const recurse = async (dir, prefix, remaining) => {
        for (const entry of await entries(dir)) {
          if (lines.length >= LIST_CAP) return;
          if (entry.isDirectory) {
            if (SKIP.has(entry.name)) continue;
            lines.push(`${prefix}${entry.name}/`);
            if (remaining > 1) await recurse(join(dir, entry.name), `${prefix}  `, remaining - 1);
          } else {
            lines.push(`${prefix}${entry.name}`);
          }
        }
      };
      await recurse(resolve(ctx.root, ctx.input.path), "", ctx.input.depth);
      const capped = lines.length >= LIST_CAP
        ? `\n… capped at ${LIST_CAP} entries — descend with path`
        : "";
      return { output: { message: (lines.join("\n") || "(empty)") + capped } };
    },
  )
  .open(
    {
      nature: "/fs/find",
      valence: "Files matching a regex over the file name, searched under a path. " +
        'Example: { pattern: "\\\\.md$", path: "." }.',
      input: v.object({
        pattern: v.string().desc("JavaScript regex matched against file names."),
        path: v.string().default("."),
        limit: v.integer({ minimum: 1, maximum: 100 }).default(50),
      }),
    },
    async (ctx) => {
      const expression = new RegExp(ctx.input.pattern);
      const start = resolve(ctx.root, ctx.input.path);
      const files = [];
      const recurse = async (dir) => {
        for (const entry of await entries(dir)) {
          if (files.length >= ctx.input.limit) return;
          const path = join(dir, entry.name);
          if (entry.isDirectory) {
            if (!SKIP.has(entry.name)) await recurse(path);
          } else if (expression.test(entry.name)) {
            files.push(path.slice(ctx.root.length + 1));
          }
        }
      };
      await recurse(start);
      return { output: { files, count: files.length } };
    },
  )
  .open(
    {
      nature: "/fs/read",
      valence: "Read a file under the root. Long files come back cut at 16 kB with a note — pass " +
        'range (line numbers, 1-based) for the rest. Example: { path: "README.md", range: ' +
        "{ from: 40, to: 120 } }.",
      input: v.object({
        path: v.string(),
        range: v
          .object({
            from: v.integer({ minimum: 1 }),
            to: v.integer({ minimum: 1 }),
          })
          .optional(),
      }),
    },
    async (ctx) => {
      const text = await Deno.readTextFile(resolve(ctx.root, ctx.input.path));
      const lines = text.split("\n");
      const { from = 1, to = lines.length } = ctx.input.range ?? {};
      let slice = lines.slice(from - 1, to).join("\n");
      let note = "";
      if (slice.length > READ_CAP) {
        slice = slice.slice(0, READ_CAP);
        note = `\n… cut at ${READ_CAP} bytes (file has ${lines.length} lines) — narrow with range`;
      }
      return { output: { message: (slice || "(empty)") + note } };
    },
  )
  .open(
    {
      nature: "/fs/write",
      valence: "Write or append a file under the root. Parent directories are created.",
      input: v.object({
        path: v.string(),
        content: v.string(),
        append: v.boolean({ default: false }),
      }),
    },
    async (ctx) => {
      const full = resolve(ctx.root, ctx.input.path);
      await Deno.mkdir(full.split("/").slice(0, -1).join("/"), { recursive: true });
      await Deno.writeTextFile(full, ctx.input.content, { append: ctx.input.append });
      return {
        output: {
          message: `${
            ctx.input.append ? "appended" : "wrote"
          } ${ctx.input.content.length} bytes to ${ctx.input.path}`,
        },
      };
    },
  );
