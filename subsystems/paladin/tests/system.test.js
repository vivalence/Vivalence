import { specimen } from "@vivalence/typology";
import { Paladin, populate } from "@vivalence/paladin/typology";

const { describe, it, beforeAll, expect } = specimen;

async function mkPaladin() {
  const root = await Deno.makeTempDir({ prefix: "paladin-system-" });
  const paladin = new Paladin();
  paladin.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT");
  paladin.env.set("VIVA_SYSTEM_ROLE", "SUDO");
  paladin.env.set("VIVA_SYSTEM_MOUNT", root);
  paladin.env.set("VIVA_REPOSITORY_MOUNT", root);
  await populate.scopes(paladin);
  await paladin.system.mount();
  return paladin;
}

describe("belt: read/state json + jsonl", () => {
  let paladin;
  let file;
  beforeAll(async () => {
    paladin = await mkPaladin();
    file = paladin.scope.system.branch("probe.json");
  });

  it("state.json writes, read.json reads back", async () => {
    await paladin.state.json(file, { a: 1, nested: { b: 2 } });
    expect(await paladin.read.json(file)).toEqual({ a: 1, nested: { b: 2 } });
  });

  it("read.json returns fallback for missing file", async () => {
    const missing = paladin.scope.system.branch("nope.json");
    expect(await paladin.read.json(missing, {})).toEqual({});
  });

  it("state.jsonl appends one line per call, read.jsonl returns the list", async () => {
    const log = paladin.scope.system.branch("probe.jsonl");
    await paladin.state.jsonl(log, { event: "a" });
    await paladin.state.jsonl(log, { event: "b" });
    expect(await paladin.read.jsonl(log)).toEqual([{ event: "a" }, { event: "b" }]);
  });

  it("state.remove deletes, read.json falls back after", async () => {
    await paladin.state.remove(file);
    expect(await paladin.read.json(file, null)).toBe(null);
  });
});

describe("System.lock", () => {
  let paladin;
  beforeAll(async () => {
    paladin = await mkPaladin();
  });

  it("write then read roundtrips the record", async () => {
    await paladin.system.lock("inst", "runtime").write({ pid: Deno.pid, process: "runtime" });
    expect(await paladin.system.lock("inst", "runtime").read()).toEqual({ pid: Deno.pid, process: "runtime" });
  });

  it("alive is true for a live pid, false after remove", async () => {
    expect(await paladin.system.lock("inst", "runtime").alive()).toBe(true);
    await paladin.system.lock("inst", "runtime").remove();
    expect(await paladin.system.lock("inst", "runtime").alive()).toBe(false);
  });

  it("alive is false for a dead pid", async () => {
    await paladin.system.lock("inst", "ghost").write({ pid: 2147483647, process: "ghost" });
    expect(await paladin.system.lock("inst", "ghost").alive()).toBe(false);
  });

  it("locks(slug) lists every lock in the slug with its process", async () => {
    await paladin.system.lock("multi", "runtime").write({ pid: Deno.pid });
    await paladin.system.lock("multi", "kajuit").write({ pid: Deno.pid });
    const listed = await paladin.system.locks("multi");
    expect(listed.map((entry) => entry.process).sort()).toEqual(["kajuit", "runtime"]);
  });

  it("locks(slug) returns [] for an unknown slug", async () => {
    expect(await paladin.system.locks("nobody")).toEqual([]);
  });
});

describe("System.instances", () => {
  let paladin;
  beforeAll(async () => {
    paladin = await mkPaladin();
  });

  it("write stamps createdAt/updatedAt and read returns the entry", async () => {
    await paladin.system.instances.write("alpha", { mount: "/x" });
    const entry = await paladin.system.instances.read("alpha");
    expect(entry.mount).toBe("/x");
    expect(typeof entry.createdAt).toBe("string");
    expect(typeof entry.updatedAt).toBe("string");
  });

  it("second write merges, preserves createdAt", async () => {
    const first = await paladin.system.instances.read("alpha");
    await paladin.system.instances.write("alpha", { mount: "/y" });
    const second = await paladin.system.instances.read("alpha");
    expect(second.mount).toBe("/y");
    expect(second.createdAt).toBe(first.createdAt);
  });

  it("read returns null for an unknown slug", async () => {
    expect(await paladin.system.instances.read("ghost")).toBe(null);
  });
});

describe("System.log", () => {
  let paladin;
  beforeAll(async () => {
    paladin = await mkPaladin();
  });

  it("append writes a jsonl span line readable via read.jsonl", async () => {
    await paladin.system.log("inst").append({ json: { event: "/turn/open" } });
    await paladin.system.log("inst").append({ json: { event: "/turn/close" } });
    const spans = await paladin.read.jsonl(paladin.scope.system.branch("/logs/inst/spans.jsonl"));
    expect(spans).toEqual([{ event: "/turn/open" }, { event: "/turn/close" }]);
  });

  it("open returns an appendable file handle for a child stream", async () => {
    const handle = await paladin.system.log("inst").open("runtime", "out");
    await handle.write(new TextEncoder().encode("hello\n"));
    handle.close();
    const text = await paladin.read.text(paladin.scope.system.branch("/logs/inst/runtime.out.log"));
    expect(text).toBe("hello\n");
  });
});
