import { join } from "@std/path";
import { contexts, fromm, mime, Mode, Path, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { gestalten, ThreadEntity } from "@vivalence/runtime";
import { paths } from "../gestalten/tools/mode.js";
import { seed } from "./scenarios/datamap.js";

// the harness tools m87 touched, armed as harnessed.js arms them (grafted whole, the host spread onto ctx), on :memory:
// — buffer_update over data and over a content buffer's source (rewrite in place), thread_update, mode_find, the thread summary

const { tools } = gestalten;

let scenario;
let directory;
let thread;

const buildMode = (type, slug, mountpoint) => {
  const mode = new Mode({ manifest: { type, slug, name: slug === "memo" ? "Memo" : undefined, traits: ["TOOLING"] }, source: { dirname: join(directory, slug) } });
  mode.mountpoint = mountpoint === undefined ? undefined : new Path(mountpoint);
  mode.reference = new Path(`/mode/${type}/${slug}`);
  mode.entity = scenario.fixtures.mode;
  mode.id = scenario.fixtures.mode.id;
  return mode;
};

const host = () => ({
  entities: scenario.repos,
  reference: new Path("/daemon/test"),
  mountpoint: new Path(join(directory, "daemon")),
  modes: { srs: { memo: buildMode("srs", "memo", join(directory, "memo")) }, home: { probe: buildMode("home", "probe") } },
});

const armed = (vector, daemon) => new Vector().graft(vector).use(shard.context.spread(contexts.daemonDie, daemon));

const invoke = async (vector, name, input) => fromm.yield(await steer.dispatch.invoke(vector, new ToolCall(name).signal, steer.strategy.guarded)(input));

specimen.describe("the harness tools — buffer · thread · mode", { sanitizeResources: false, sanitizeOps: false }, () => {
  specimen.beforeAll(async () => {
    scenario = await seed();
    directory = await Deno.makeTempDir({ prefix: "tools-" });
    await Deno.mkdir(join(directory, "memo"), { recursive: true });
    thread = scenario.em.create(ThreadEntity, { user: scenario.fixtures.user, mode: scenario.fixtures.mode, traits: ["LABELED"], trait: { LABELED: { name: "filings" } } });
    await scenario.em.flush();
  });
  specimen.afterAll(async () => {
    await scenario.orm.close();
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it("buffer_update with neither data nor source is refused; a data patch merges over the row's data", async () => {
    const daemon = host();
    const vector = armed(tools.buffer, daemon);
    const buffer = await scenario.repos.buffer.create({ mode: scenario.fixtures.mode.id, thread: thread.id, data: { title: "Q3", summary: "draft" } });
    await scenario.em.flush();

    const refused = await invoke(vector, "buffer_update", { id: buffer.id });
    specimen.expect(refused.condition).toBe("ERROR");
    specimen.expect(refused.output.message).toMatch(/nothing to change/);

    const patched = await invoke(vector, "buffer_update", { id: buffer.id, data: { summary: "final" } });
    specimen.expect(patched.condition).toBe("NOMINAL");
    specimen.expect(patched.output.message).toBe(`updated "test #${buffer.index}"`);
    specimen.expect(patched.output.buffer[0].data).toEqual({ title: "Q3", summary: "final" });
  });

  specimen.it("buffer_update with a source rewrites the file of the buffer's own kind in place — same row, same mount, new hash; a buffer without one refuses", async () => {
    const daemon = host();
    const vector = armed(tools.buffer, daemon);
    const mount = join(directory, "memo", "q3.md");
    await Deno.writeTextFile(mount, "# Q3");
    const file = await scenario.repos.file.create({ mode: scenario.fixtures.mode, path: "q3.md", mount, mime: mime.markdown, hash: "h0", integrity: "sha256-h0", bytes: 4 });
    const content = await scenario.repos.buffer.create({ mode: scenario.fixtures.mode.id, thread: thread.id, mime: mime.markdown, traits: ["LABELED"], trait: { LABELED: { name: "Annual accounts" } } });
    content.files.add(file);
    const plain = await scenario.repos.buffer.create({ mode: scenario.fixtures.mode.id, thread: thread.id, mime: mime.markdown });
    await scenario.em.flush();

    const rewritten = await invoke(vector, "buffer_update", { id: content.id, source: "# Q3 · final" });
    specimen.expect(rewritten.condition).toBe("NOMINAL");
    specimen.expect(rewritten.output.message).toBe('updated "Annual accounts"');
    specimen.expect(await Deno.readTextFile(mount)).toBe("# Q3 · final");
    specimen.expect(file.hash).not.toBe("h0");
    specimen.expect(file.integrity).toBe(`sha256-${file.hash}`);
    specimen.expect(file.bytes).toBe(new TextEncoder().encode("# Q3 · final").length);

    const refused = await invoke(vector, "buffer_update", { id: plain.id, source: "# nothing to load" });
    specimen.expect(refused.condition).toBe("ERROR");
    specimen.expect(refused.output.message).toMatch(/loads no file of its own kind text\/markdown/);
  });

  specimen.it("thread_update merges trait data by name", async () => {
    const daemon = host();
    const vector = armed(tools.thread, daemon);
    const updated = await invoke(vector, "thread_update", { id: thread.id, trait: { LABELED: { name: "Q3 filings" }, MASKED: { where: {} } } });
    specimen.expect(updated.condition).toBe("NOMINAL");
    specimen.expect(updated.output.thread[0].trait).toMatchObject({ LABELED: { name: "Q3 filings" }, MASKED: { where: {} } });
  });

  specimen.it("mode_find lists the host and every mode with its places; type or slug narrows; places() is empty for a mode with none", async () => {
    const daemon = host();
    const vector = armed(tools.mode, daemon);
    const all = await invoke(vector, "mode_find", {});
    specimen.expect(all.condition).toBe("NOMINAL");
    specimen.expect(all.output.message.split("\n")).toEqual([
      `[Host /daemon/test] · mountpoint ${join(directory, "daemon")}`,
      `srs/memo · Memo · traits TOOLING · source ${join(directory, "memo")} · mountpoint ${join(directory, "memo")}`,
      `home/probe · probe · traits TOOLING · source ${join(directory, "probe")}`,
    ]);
    specimen.expect((await invoke(vector, "mode_find", { type: "home" })).output.message.split("\n")).toHaveLength(2);
    specimen.expect((await invoke(vector, "mode_find", { slug: "memo" })).output.message.split("\n")[1]).toMatch(/^srs\/memo/);
    specimen.expect((await invoke(vector, "mode_find", { slug: "nobody" })).output.message.split("\n")).toHaveLength(1);

    const bare = new Mode({ manifest: { type: "home", slug: "bare" } });
    specimen.expect(paths(bare)).toBe("");
    const read = new Mode({ manifest: { type: "home", slug: "read" }, source: { dirname: "/src" } });
    read.mountpoint = new Path("/mnt");
    read.files = { directory: "/elsewhere" };
    specimen.expect(paths(read)).toBe("source /src · mountpoint /mnt · files /elsewhere");
    read.files = { directory: "/mnt" };
    specimen.expect(paths(read)).toBe("source /src · mountpoint /mnt");
  });
});
