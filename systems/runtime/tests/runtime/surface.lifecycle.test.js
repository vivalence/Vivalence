import { specimen } from "@vivalence/typology";
import { board, IMPORT, MOUNT, part, surfaced } from "../scenarios/surfaced.js";

// m120 Q6 — the six named cases of a declared view's read-through: /attached/view/:id builds at the first fetch,
// answers 304 to a held fingerprint, rebuilds when a source changed, never builds at a restart, one build for two opens

const { describe, it, expect, beforeEach, afterEach } = specimen;

describe("a declared surface is built when it is fetched, rebuilt when its sources changed", { sanitizeResources: false, sanitizeOps: false }, () => {
  let world;

  beforeEach(async () => {
    world = await surfaced();
  });
  afterEach(() => world.close());

  it("builds on first open — seated unbuilt, the File appears with the fetch", async () => {
    expect(world.surface.entry).toBe("bundle/board.tty.solid.mjs");
    expect(world.builds).toEqual([]);
    const response = await world.open();
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("board ");
    expect(world.builds).toEqual(["bundle/board.tty.solid.mjs"]);
    const file = await world.scenario.repos.file.findOneOrFail({ surface: world.surface.id, path: world.surface.entry });
    expect(response.headers.get("etag")).toBe(`"${file.integrity}"`);
    expect(response.headers.get("x-viva-integrity")).toBe(file.integrity);
  });

  it("answers 304 to a client holding the fingerprint, and the body to one holding another", async () => {
    const first = await world.open();
    await first.body?.cancel();
    const held = await world.open({ "if-none-match": first.headers.get("etag") });
    expect(held.status).toBe(304);
    expect(held.headers.get("etag")).toBe(first.headers.get("etag"));
    const stale = await world.open({ "if-none-match": `"sha256-0000"` });
    expect(stale.status).toBe(200);
    await stale.body?.cancel();
    expect(world.builds).toHaveLength(1);
  });

  it("rebuilds after the mount file changes", async () => {
    const first = await world.open();
    await first.body?.cancel();
    await world.edit(MOUNT, board("edited"));
    const second = await world.open({ "if-none-match": first.headers.get("etag") });
    expect(second.status).toBe(200);
    expect(await second.text()).toContain("board edited");
    expect(second.headers.get("etag")).not.toBe(first.headers.get("etag"));
    expect(world.builds).toHaveLength(2);
  });

  it("rebuilds after an imported file changes", async () => {
    const first = await world.open();
    await first.body?.cancel();
    await world.edit(IMPORT, part("edited"));
    const second = await world.open();
    expect(await second.text()).toContain("part edited");
    expect(world.builds).toHaveLength(2);
  });

  it("survives a restart without building", async () => {
    const first = await world.open();
    await first.body?.cancel();
    const { mtime } = await Deno.stat(world.artifact);
    world.restart();
    const second = await world.open({ "if-none-match": first.headers.get("etag") });
    expect(second.status).toBe(304);
    expect(world.builds).toHaveLength(1);
    expect((await Deno.stat(world.artifact)).mtime).toEqual(mtime);
  });

  it("two opens at once share one build", async () => {
    const [left, right] = await Promise.all([world.open(), world.open()]);
    expect([left.status, right.status]).toEqual([200, 200]);
    expect(await left.text()).toBe(await right.text());
    expect(world.builds).toHaveLength(1);
  });
});
