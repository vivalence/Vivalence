import { dirname, join, relative, SEPARATOR } from "@std/path";
import paladin from "@vivalence/paladin";
import { mime, Path, v, Vector } from "@vivalence/typology";
import { fronted, joined, parted, pressed, SOURCES } from "../press.js";
import { Article, Site } from "../schematics.js";
import { paged } from "../theme/index.js";

const Named = v.object({
  path: v.string().desc("A file's path under source/.").example("on/machines.md"),
});

const Draft = v.object({
  path: Named.properties.path,
  front: v
    .object({}, { additionalProperties: true })
    .desc("Its front matter, every key as written, the article's and any other.")
    .example({ title: "Hello", date: "2026.11.24", status: "draft" }),
  body: v.string().desc("The source under its front matter.").example("\nText.\n"),
});

const Moved = v.object({
  path: Named.properties.path,
  to: v.string().desc("Its new path under source/.").example("on/conscious-machines.md"),
});

const Listed = v.object({
  path: Named.properties.path,
  article: v
    .union([v.object({ ...Article.properties, page: v.string(), title: v.string() }), v.null()])
    .desc("What its front matter declares, null when it faults.")
    .example({
      page: "on/machines.html",
      title: "Conscious Machines",
      date: "2026.08.07",
      status: "published",
    }),
  fault: v
    .union([v.string(), v.null()])
    .desc("Why its front matter does not hold, null when it does.")
    .example("[blog] on/machines.md: /status must match a schema in anyOf"),
});

const Kept = v.object({
  path: Named.properties.path,
  mime: v.string().desc("What it is served as.").example("image/png"),
});

const Shelf = v.object({
  site: v
    .string()
    .desc("Where a stranger reaches the pressed site.")
    .example("http://localhost:2501/attached/runtime/runtime/mode/publisher/blog"),
  sources: v.array(Listed).desc("Every .md · .org under source/, by path."),
  files: v
    .array(Kept)
    .desc("Every other file under source/, by path: pictures, a sheet, robots.txt."),
});

const Built = v.object({
  pages: v
    .array(v.string())
    .desc("Every file under public/ this build wrote, unchanged ones left out.")
    .example(["hello.html", "index.html"]),
  gone: v
    .array(v.string())
    .desc(
      "Every file this build took off the site: " +
        "a draft's page, a deleted source's, a deleted picture.",
    )
    .example(["on/withdrawn.html"]),
});

const Preview = v.object({
  html: v
    .string()
    .desc("The page as a build would press it, a draft too, its links based on the site."),
});

const seat = (ctx) => new Path(ctx.mode.mountpoint).absolute;

const site = (ctx) => ctx.attach.branch(ctx.reference).branch(ctx.mode.reference).absolute;

const within = (ctx, path) => {
  const source = join(seat(ctx), "source");
  const mount = join(source, path);
  if (relative(source, mount).startsWith("..")) throw new Error(`[blog] '${path}' leaves source/`);
  return mount;
};

const sources = async (ctx) => {
  const source = join(seat(ctx), "source");
  await paladin.state.dir(source);
  const files = await paladin.find.walk(SOURCES)(source);
  const read = await Promise.all(
    files.map(async (file) => ({
      path: relative(source, file.absolute),
      text: await paladin.read.text(file),
    })),
  );
  return read.sort((left, right) => (left.path < right.path ? -1 : 1));
};

const kept = async (ctx) => {
  const source = join(seat(ctx), "source");
  await paladin.state.dir(source);
  return (await paladin.find.walk(/./)(source))
    .filter((file) => !SOURCES.test(file.absolute))
    .map((file) => relative(source, file.absolute))
    .sort()
    .map((path) => ({ path, mime: mime.of(path) }));
};

const listed = ({ path, text }) => {
  try {
    return { path, article: fronted(path, text), fault: null };
  } catch (error) {
    return { path, article: null, fault: error.message };
  }
};

const settings = async (ctx) =>
  Site.cast(await paladin.read.json(join(seat(ctx), "site.json"), {}));

export const aperture = new Vector()
  .open(
    {
      nature: "/build",
      output: Built,
      valence:
        "press the blog — every .md · .org under source/ becomes a page under public/, " +
        "the index lists its essays. Example: /build",
    },
    async (ctx) => {
      const source = join(seat(ctx), "source");
      const articles = await Promise.all(
        (await sources(ctx)).map(({ path, text }) => pressed(path, text)),
      );

      const written = [];
      const held = [];
      for (const [page, text] of paged(await settings(ctx), articles)) {
        const mount = join(seat(ctx), "public", page);
        if (await paladin.state.scribe(mount, text)) written.push(page);
        held.push(mount);
        await ctx.entities.file.record({
          mode: ctx.mode.id,
          path: page,
          mount,
          mime: mime.of(page),
          bytes: new TextEncoder().encode(text),
        });
      }

      for (const file of await kept(ctx)) {
        const mount = join(source, file.path);
        held.push(mount);
        await ctx.entities.file.record({
          mode: ctx.mode.id,
          path: file.path,
          mount,
          mime: file.mime,
          bytes: await paladin.read.bytes(mount),
        });
      }

      const gone = (await ctx.entities.file.find({ mode: ctx.mode.id })).filter(
        (file) =>
          ["public", "source"].some((folder) =>
            file.mount.startsWith(join(seat(ctx), folder) + SEPARATOR),
          ) && !held.includes(file.mount),
      );
      for (const file of gone) {
        if (file.mount.startsWith(join(seat(ctx), "public") + SEPARATOR))
          await paladin.state.remove(file.mount);
        await ctx.entities.file.remove({ id: file.id });
      }
      return { pages: written, gone: gone.map((file) => file.path) };
    },
  )
  .open(
    {
      nature: "/source/list",
      output: Shelf,
      valence:
        "the desk's shelf — every source with what its front matter declares. " +
        "Example: /source/list",
    },
    async (ctx) => ({
      site: site(ctx),
      sources: (await sources(ctx)).map(listed),
      files: await kept(ctx),
    }),
  )
  .open(
    {
      nature: "/source/read",
      input: Named,
      output: Draft,
      valence:
        "one source as written, its front matter apart from its body. " +
        'Example: /source/read {"path":"on/machines.md"}',
    },
    async (ctx) => ({
      path: ctx.input.path,
      ...parted(ctx.input.path, await paladin.read.text(within(ctx, ctx.input.path))),
    }),
  )
  .open(
    {
      nature: "/source/write",
      input: Draft,
      output: Named,
      valence:
        "write one source to disk, its front matter merged into the one there, comments kept; " +
        "no page moves until /build. " +
        'Example: /source/write {"path":"on/new.md","front":{"title":"New"},"body":"…"}',
    },
    async (ctx) => {
      const mount = within(ctx, ctx.input.path);
      const text = await Deno.readTextFile(mount).catch((error) => {
        if (error instanceof Deno.errors.NotFound) return "";
        throw error;
      });
      await paladin.state.scribe(mount, joined(ctx.input.path, ctx.input, text));
      return { path: ctx.input.path };
    },
  )
  .open(
    {
      nature: "/source/remove",
      input: Named,
      output: Named,
      valence:
        "take one source off the disk; its page goes with the next /build. " +
        'Example: /source/remove {"path":"on/old.md"}',
    },
    async (ctx) => {
      await Deno.remove(within(ctx, ctx.input.path));
      return { path: ctx.input.path };
    },
  )
  .open(
    {
      nature: "/source/move",
      input: Moved,
      output: Named,
      valence:
        "move one file under source/ to a new path; its old page goes with the next /build. " +
        'Example: /source/move {"path":"on/new.md","to":"on/machines.md"}',
    },
    async (ctx) => {
      const to = within(ctx, ctx.input.to);
      if (await Deno.stat(to).then(() => true, () => false))
        throw new Error(`[blog] '${ctx.input.to}' is taken`);
      await paladin.state.dir(dirname(to));
      await Deno.rename(within(ctx, ctx.input.path), to);
      return { path: ctx.input.to };
    },
  )
  .open(
    {
      nature: "/source/preview",
      input: Draft,
      output: Preview,
      valence:
        "one source pressed as it is typed, nothing written, a draft shown too. " +
        "Example: /source/preview {…}",
    },
    async (ctx) => {
      const typed = await pressed(ctx.input.path, joined(ctx.input.path, ctx.input, ""));
      const others = (await sources(ctx))
        .filter((source) => source.path !== ctx.input.path)
        .map(listed)
        .filter((source) => source.article !== null)
        .map((source) => ({ ...source.article, body: "" }));
      const shown = { ...typed, status: typed.status === "draft" ? "unlisted" : typed.status };
      const html = new Map(paged(await settings(ctx), [...others, shown])).get(shown.page);
      return { html: html.replace("<head>", `<head>\n<base href="${site(ctx)}/${shown.page}">`) };
    },
  )
  .open(
    {
      nature: "/source/upload/:name",
      output: Named,
      valence:
        "a picture's bytes into source/images/, served after the next /build. " +
        "Example: POST /source/upload/heron.png",
    },
    async (ctx) => {
      const path = join("images", ctx.params.name);
      const bytes = new Uint8Array(await new Response(ctx.request.raw.body).arrayBuffer());
      await paladin.state.store(within(ctx, path), bytes);
      return { path };
    },
  );
