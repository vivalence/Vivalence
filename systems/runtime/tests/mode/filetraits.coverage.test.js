import { join } from "@std/path";
import { Aperture, crypto, mime, Mode, Path, shape, specimen, steer, v } from "@vivalence/typology";
import { FileEntity, ThreadEntity, traits, ViewEntity } from "@vivalence/runtime";
import { seed } from "../scenarios/datamap.js";

// m87 law 8 on :memory: — FILESINK receives, FILESET reads a directory into File rows, VIEWABLE bundles the declared
// views and mints the buffer mime. HOME is empty; every
// mount lives in a temp dir of this test's own; the html bundler row reads a file and never touches esbuild.

const { FILESINK, FILESET, VIEWABLE } = traits.mode;

let scenario;
let directory;

const context = () => ({ entities: scenario.repos, reference: new Path("/daemon/test") });
const threaded = async () => {
  const thread = scenario.em.create(ThreadEntity, { user: scenario.fixtures.user, mode: scenario.fixtures.mode, trait: {}, cursor: 0, counter: 0 });
  await scenario.em.flush();
  return thread;
};
const reload = (Entity, where, populate) => scenario.em.fork().findOneOrFail(Entity, where, { populate });
const bytes = (text) => new TextEncoder().encode(text);
const receive = (mode, input) => steer.dispatch.invoke(mode.aperture, "/files/receive", steer.strategy.guarded)(input);

const buildMode = (slug, module = {}) => {
  const mode = new Mode({ manifest: { type: "test", slug, traits: [] }, source: { dirname: join(directory, slug) }, ...module });
  mode.aperture = new Aperture();
  mode.entity = scenario.fixtures.mode;
  mode.mountpoint = join(directory, slug, "mountpoint");
  return mode;
};

specimen.describe("the file traits — FILESINK · FILESET · VIEWABLE over a seeded :memory: datamap", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
    directory = await Deno.makeTempDir({ prefix: "filetraits-" });
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("entities.file.record() ensures one row per (mode, path) with sha256 hash · integrity · bytes", async () => {
    const mode = buildMode("record");
    const first = await context().entities.file.record({ mode: mode.entity.id, path: "a.md", mount: "/nowhere/a.md", mime: mime.markdown, bytes: bytes("# a") });
    const hash = await crypto.digestBytes(bytes("# a"));
    specimen.expect([first.path, first.mime, first.hash, first.integrity, first.bytes]).toEqual(["a.md", mime.markdown, hash, `sha256-${hash}`, 3]);
    const again = await context().entities.file.record({ mode: mode.entity.id, path: "a.md", mount: "/nowhere/a.md", mime: mime.markdown, bytes: bytes("# aa") });
    specimen.expect(again.id).toBe(first.id);
    specimen.expect((await reload(FileEntity, { id: first.id })).bytes).toBe(4);
    specimen.expect(await scenario.em.fork().count(FileEntity, { path: "a.md" })).toBe(1);
  });

  specimen.it("FILESINK: receive stores the bytes under the mountpoint and records the row; the same path again is the same row; the extension names the mime", async () => {
    const mode = buildMode("sink");
    FILESINK(mode, context());
    specimen.expect(mode.files).toBe(undefined);

    const file = await receive(mode, { path: "notes/q3.md", bytes: bytes("# Q3") });
    specimen.expect(file.mount).toBe(join(directory, "sink", "mountpoint", "notes/q3.md"));
    specimen.expect(file.mime).toBe(mime.markdown);
    specimen.expect(await Deno.readTextFile(file.mount)).toBe("# Q3");

    const same = await receive(mode, { path: "notes/q3.md", bytes: bytes("# Q3 · final"), mime: mime.plain });
    specimen.expect(same.id).toBe(file.id);
    specimen.expect(await Deno.readTextFile(file.mount)).toBe("# Q3 · final");
    specimen.expect((await reload(FileEntity, { id: file.id })).mime).toBe(mime.plain);
  });

  specimen.it("FILESINK: the /files/receive route is opened on the mode's aperture, guarded by Received — a bare body is refused before any write", async () => {
    const mode = buildMode("route");
    FILESINK(mode, context());
    specimen.expect(Object.keys(shape.strip(mode.aperture).branches)).toEqual(["files"]);
    const call = steer.dispatch.invoke(mode.aperture, "/files/receive", steer.strategy.guarded);
    await specimen.expect(call({ bytes: new Uint8Array() })).rejects.toThrow();
    specimen.expect(await scenario.em.fork().count(FileEntity, { mount: { $like: `${join(directory, "route")}%` } })).toBe(0);
  });

  specimen.it("entities.file.rewrite(): the row is rewritten in place — same row, new hash, new size; the disk is the caller's", async () => {
    const mode = buildMode("rewrite");
    FILESINK(mode, context());
    const file = await receive(mode, { path: "draft.md", bytes: bytes("one") });
    const before = file.hash;
    const written = await context().entities.file.rewrite(file, bytes("one two"));
    specimen.expect(written.id).toBe(file.id);
    specimen.expect(written.hash).not.toBe(before);
    specimen.expect(written.integrity).toBe(`sha256-${written.hash}`);
    specimen.expect(written.bytes).toBe(7);
    specimen.expect(await Deno.readTextFile(file.mount)).toBe("one");
  });

  specimen.it("FILESET: the declared directory is walked into File rows — path relative to it, mime by extension, bytes read; mode.files.directory names it", async () => {
    const mode = buildMode("set", { fileset: { path: "files" } });
    const files = join(directory, "set", "files");
    await Deno.mkdir(join(files, "audio"), { recursive: true });
    await Deno.writeTextFile(join(files, "README.md"), "# fileset");
    await Deno.writeFile(join(files, "audio", "tempus-fugit.wav"), new Uint8Array([82, 73, 70, 70]));

    await FILESET(mode, context());
    specimen.expect(mode.files.directory).toBe(files);
    const rows = await scenario.em.fork().find(FileEntity, { mount: { $like: `${files}%` } }, { orderBy: { path: "asc" } });
    specimen.expect(rows.map((row) => [row.path, row.mime, row.bytes])).toEqual([
      ["README.md", mime.markdown, 9],
      ["audio/tempus-fugit.wav", "audio/wav", 4],
    ]);
    specimen.expect(rows[1].integrity).toBe(`sha256-${await crypto.digestBytes(new Uint8Array([82, 73, 70, 70]))}`);

    await FILESET(mode, context());
    specimen.expect(await scenario.em.fork().count(FileEntity, { mount: { $like: `${files}%` } })).toBe(2);
  });

  specimen.it("VIEWABLE: mode.buffer mints with the mode's reference mime and the schema's defaults; the declared views bundle to View rows whose entry is the compile", async () => {
    const mode = buildMode("viewable", {
      buffer: v.buffer({ data: { title: v.string({ default: "untitled" }), count: v.number({ default: 0 }) } }),
      views: [{ slug: "page", mime: mime.dom.html, mount: "views/page.html" }],
    });
    await Deno.mkdir(join(directory, "viewable", "views"), { recursive: true });
    await Deno.writeTextFile(join(directory, "viewable", "views", "page.html"), "<h1>page</h1>");

    await VIEWABLE(mode, context());
    specimen.expect(mode.buffer.mime).toBe("application/vnd.viva.daemon.test.mode.test.viewable+json");

    const thread = await threaded();
    const buffer = await mode.buffer({ data: { title: "Q3" }, thread: thread.id });
    await scenario.em.flush();
    specimen.expect(buffer.mime).toBe(mode.buffer.mime);
    specimen.expect(buffer.data).toEqual({ title: "Q3", count: 0 });
    specimen.expect((await mode.buffer({ data: {}, thread: thread.id })).data).toEqual({ title: "untitled", count: 0 });

    specimen.expect(mode.views).toHaveLength(1);
    const view = await reload(ViewEntity, { id: mode.views[0].id }, ["files"]);
    specimen.expect([view.slug, view.mime]).toEqual(["page", mime.dom.html]);
    specimen.expect(view.entry).toMatch(/^bundle\/[0-9a-f]{16}\.dom\.html\.mjs$/);
    const compiled = view.files.getItems().find((file) => file.path === view.entry);
    specimen.expect(compiled.mime).toBe(mime.javascript);
    specimen.expect(compiled.mount).toBe(join(directory, "viewable", "mountpoint", view.entry));
    specimen.expect(await Deno.readTextFile(compiled.mount)).toContain("<h1>page</h1>");
  });

  specimen.it("VIEWABLE: a module without a buffer mints no mode.buffer; without views it bundles nothing", async () => {
    const mode = buildMode("bare");
    await VIEWABLE(mode, context());
    specimen.expect(mode.buffer).toBe(undefined);
    specimen.expect(mode.views).toBe(undefined);
  });
});
