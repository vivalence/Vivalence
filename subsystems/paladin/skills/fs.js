import { extname, join, normalize } from "@std/path";
import { v, Vector } from "@vivalence/typology";
import { skip } from "../belt/ignore.js";

const READ_CAP = 16_000;
const LIST_CAP = 200;

export const resolve = (root, path = ".") => {
  const base = root.endsWith("/") ? root : `${root}/`;
  // a URL is only the normaliser here; the answer is a filesystem path, so the escapes it adds come back off
  const full = decodeURIComponent(new URL(encodeURI(path.replace(/^\/+/, "")), `file://${base}`).pathname);
  if (full !== root && `${full}/` !== base && !full.startsWith(base)) {
    throw new Error(`path '${path}' escapes the root — paths are relative to ${root}`);
  }
  return full;
};

// nothing is bound: every path the tools take is absolute. The mode section of the context names this
// mode's places (source · mountpoint · freight); mode_find lists every mode's. A refusal says so.
const PLACES = "your mode's places are in the mode section of your context; mode_find lists every mode's";
export const absolute = (path) => {
  if (!path.startsWith("/")) throw new Error(`path '${path}' is not absolute — ${PLACES}`);
  return normalize(path);
};
const PATH = (what) =>
  v.string().desc(`Absolute path to ${what}. Example: "/home/operator/jdex/20-29 company"`);

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
        "The directory tree under an absolute path. Ground here before reading: your mode's places " +
        "(source · mountpoint · freight) are in the mode section of your context, every mode's come " +
        'from mode_find. Example: { path: "/home/operator/jdex", depth: 2 }.',
      input: v.object({
        path: PATH("a directory"),
        depth: v.integer({ minimum: 1, maximum: 5 }).default(2),
      }),
    },
    async (ctx) => {
      const lines = [];
      const skipped = skip(ctx.ignore);
      const recurse = async (dir, prefix, remaining) => {
        for (const entry of await entries(dir)) {
          if (lines.length >= LIST_CAP) return;
          if (skipped(entry.name)) continue;
          if (entry.isDirectory) {
            lines.push(`${prefix}${entry.name}/`);
            if (remaining > 1) await recurse(join(dir, entry.name), `${prefix}  `, remaining - 1);
          } else {
            lines.push(`${prefix}${entry.name}`);
          }
        }
      };
      await recurse(absolute(ctx.input.path), "", ctx.input.depth);
      const capped = lines.length >= LIST_CAP
        ? `\n… capped at ${LIST_CAP} entries — descend with path`
        : "";
      return { output: { message: (lines.join("\n") || "(empty)") + capped } };
    },
  )
  .open(
    {
      nature: "/fs/find",
      valence: "Files matching a regex over the file name, searched under an absolute path; answers " +
        'absolute paths. Example: { pattern: "\\\\.md$", path: "/home/operator/jdex" }.',
      input: v.object({
        pattern: v.string().desc('JavaScript regex matched against file names. Example: "\\\\.md$"'),
        path: PATH("the directory to search"),
        limit: v.integer({ minimum: 1, maximum: 100 }).default(50),
      }),
    },
    async (ctx) => {
      const expression = new RegExp(ctx.input.pattern);
      const start = absolute(ctx.input.path);
      const files = [];
      const skipped = skip(ctx.ignore);
      const recurse = async (dir) => {
        for (const entry of await entries(dir)) {
          if (files.length >= ctx.input.limit) return;
          if (skipped(entry.name)) continue;
          const path = join(dir, entry.name);
          if (entry.isDirectory) {
            await recurse(path);
          } else if (expression.test(entry.name)) {
            files.push(path);
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
      valence: "Read a file at an absolute path. Long files come back cut at 16 kB with a note — pass " +
        'range (line numbers, 1-based) for the rest. Example: { path: "/home/operator/jdex/README.md", ' +
        "range: { from: 40, to: 120 } }.",
      input: v.object({
        path: PATH("the file"),
        range: v
          .object({
            from: v.integer({ minimum: 1 }),
            to: v.integer({ minimum: 1 }),
          })
          .optional(),
      }),
    },
    async (ctx) => {
      const text = await Deno.readTextFile(absolute(ctx.input.path));
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
      valence: "Write or append a file at an absolute path. Parent directories are created. " +
        'Example: { path: "/home/operator/jdex/22 finance/22.04 notes.md", content: "# notes" }.',
      input: v.object({
        path: PATH("the file"),
        content: v.string().desc('The whole text to write, or the text to append. Example: "# notes"'),
        append: v.boolean({ default: false }),
      }),
    },
    async (ctx) => {
      const full = absolute(ctx.input.path);
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
  )
  .open(
    {
      nature: "/fs/stat",
      valence: "Size, modification time and format of one file at an absolute path. " +
        'Example: { path: "/home/operator/jdex/README.md" }.',
      input: v.object({ path: PATH("the file") }),
    },
    async (ctx) => {
      const stat = await Deno.stat(absolute(ctx.input.path));
      return {
        output: {
          bytes: stat.size,
          mtime: stat.mtime?.toISOString() ?? null,
          format: extname(ctx.input.path).slice(1).toLowerCase(),
          directory: stat.isDirectory,
        },
      };
    },
  )
  .open(
    {
      nature: "/fs/move",
      valence: "Move or rename a file, both ends absolute; parent directories are created. " +
        'Example: { from: "/home/operator/jdex/draft.md", to: "/home/operator/jdex/22 finance/22.04 draft.md" }.',
      input: v.object({ from: PATH("the file as it is"), to: PATH("where it goes") }),
    },
    async (ctx) => {
      const from = absolute(ctx.input.from);
      const to = absolute(ctx.input.to);
      await Deno.mkdir(to.split("/").slice(0, -1).join("/"), { recursive: true });
      await Deno.rename(from, to);
      return { output: { message: `moved ${ctx.input.from} → ${ctx.input.to}` } };
    },
  )
  .open(
    {
      nature: "/fs/delete",
      valence: "Delete one file at an absolute path. Directories are refused. " +
        'Example: { path: "/home/operator/jdex/draft.md" }.',
      input: v.object({ path: PATH("the file") }),
    },
    async (ctx) => {
      const full = absolute(ctx.input.path);
      const stat = await Deno.stat(full);
      if (stat.isDirectory) return { condition: "ERROR", output: { message: `${ctx.input.path} is a directory` } };
      await Deno.remove(full);
      return { output: { message: `deleted ${ctx.input.path}` } };
    },
  );
