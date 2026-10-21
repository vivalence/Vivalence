import { join } from "@std/path";
import { contexts, fromm, mime, Mode, Path, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { gestalten, ThreadEntity } from "@vivalence/runtime";
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

const armed = (vector, daemon) => new Vector().graft(vector).use(shard.context.spread(contexts.host, daemon));

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
    const vector = armed(tools.buffer.buffer, daemon);
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
    const vector = armed(tools.buffer.buffer, daemon);
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

  specimen.it("thread_update merges trait data by name; the summary lists the thread, the mode's places and every buffer row", async () => {
    const daemon = host();
    const vector = armed(tools.thread.thread, daemon);
    const updated = await invoke(vector, "thread_update", { id: thread.id, trait: { LABELED: { name: "Q3 filings" }, MASKED: { where: {} } } });
    specimen.expect(updated.condition).toBe("NOMINAL");
    specimen.expect(updated.output.thread[0].trait).toMatchObject({ LABELED: { name: "Q3 filings" }, MASKED: { where: {} } });

    const summary = await tools.thread.summary({ modes: daemon.modes, entities: daemon.entities, mode: daemon.modes.srs.memo, thread });
    const lines = summary.split("\n");
    specimen.expect(lines[0]).toBe(`[Thread ${thread.id}] · Q3 filings · phase ${thread.phase} · buffers minted ${thread.counter} · traits LABELED INTELLIGENT VOCAL · user ${scenario.fixtures.user.id}`);
    specimen.expect(lines[1]).toBe(`[Mode srs/memo] Memo · traits TOOLING · source ${join(directory, "memo")} · mountpoint ${join(directory, "memo")}`);
    specimen.expect(lines[2]).toMatch(/^\[Buffers on this thread\] · 3 · rows:/);
    specimen.expect(lines[3]).toMatch(new RegExp(`^0 · [0-9a-f-]+ · test #0 · (srs/memo|home/probe) · PENDING · ${mime.json} · \\{"title":"Q3","summary":"final"\\}$`));
    specimen.expect(lines[4]).toMatch(/^1 · [0-9a-f-]+ · Annual accounts · (srs\/memo|home\/probe) · PENDING · text\/markdown · \{\}$/);
    specimen.expect(lines[5]).toMatch(/^2 · [0-9a-f-]+ · test #2 · (srs\/memo|home\/probe) · PENDING · text\/markdown · \{\}$/);
    specimen.expect(lines).toHaveLength(6);
  });

  specimen.it("the summary clips a wide data row to 320 characters and names its keys", async () => {
    const daemon = host();
    const buffer = await scenario.repos.buffer.create({ mode: scenario.fixtures.mode.id, thread: thread.id, data: { wide: "x".repeat(400), keys: 1 } });
    await scenario.em.flush();
    const summary = await tools.thread.summary({ modes: daemon.modes, entities: daemon.entities, mode: daemon.modes.home.probe, thread });
    const row = summary.split("\n").find((line) => line.includes(buffer.id));
    specimen.expect(row).toMatch(/… keys wide keys$/);
    specimen.expect(summary.split("\n")[1]).toBe(`[Mode home/probe] probe · traits TOOLING · source ${join(directory, "probe")}`);
  });

  specimen.it("mode_find lists the host and every mode with its places; type or slug narrows; places() is empty for a mode with none", async () => {
    const daemon = host();
    const vector = armed(tools.mode.mode, daemon);
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
    specimen.expect(tools.mode.places(bare)).toBe("");
    const read = new Mode({ manifest: { type: "home", slug: "read" }, source: { dirname: "/src" } });
    read.mountpoint = new Path("/mnt");
    read.files = { directory: "/elsewhere" };
    specimen.expect(tools.mode.places(read)).toBe("source /src · mountpoint /mnt · files /elsewhere");
    read.files = { directory: "/mnt" };
    specimen.expect(tools.mode.places(read)).toBe("source /src · mountpoint /mnt");
  });
});
