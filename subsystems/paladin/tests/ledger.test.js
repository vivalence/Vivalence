import { specimen } from "@vivalence/typology";
import { Paladin, populate } from "@vivalence/paladin/typology";

const { describe, it, beforeAll, expect } = specimen;

async function mkPaladin() {
  const root = await Deno.makeTempDir({ prefix: "paladin-system-" });
  const paladin = new Paladin();
  paladin.env.set("VIVA_SYSTEM_MODE", "DEVELOPMENT");
  paladin.env.set("VIVA_SYSTEM_ROLE", "SUDO");
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  paladin.env.set("VIVA_REPOSITORY_MOUNT", root);
  await populate.scopes(paladin);
  await paladin.ledger.mount();
  return paladin;
}

describe("belt: read/state json + jsonl", () => {
  let paladin;
  let file;
  beforeAll(async () => {
    paladin = await mkPaladin();
    file = paladin.scope.ledger.branch("probe.json");
  });

  it("state.json writes, read.json reads back", async () => {
    await paladin.state.json(file, { a: 1, nested: { b: 2 } });
    expect(await paladin.read.json(file)).toEqual({ a: 1, nested: { b: 2 } });
  });

  it("read.json returns fallback for missing file", async () => {
    const missing = paladin.scope.ledger.branch("nope.json");
    expect(await paladin.read.json(missing, {})).toEqual({});
  });

  it("state.jsonl appends one line per call, read.jsonl returns the list", async () => {
    const log = paladin.scope.ledger.branch("probe.jsonl");
    await paladin.state.jsonl(log, { event: "a" });
    await paladin.state.jsonl(log, { event: "b" });
    expect(await paladin.read.jsonl(log)).toEqual([{ event: "a" }, { event: "b" }]);
  });

  it("state.remove deletes, read.json falls back after", async () => {
    await paladin.state.remove(file);
    expect(await paladin.read.json(file, null)).toBe(null);
  });
});

describe("Ledger.lock", () => {
  let paladin;
  beforeAll(async () => {
    paladin = await mkPaladin();
  });

  it("write then read roundtrips the record", async () => {
    await paladin.ledger.lock("inst", "runtime").write({ pid: Deno.pid, process: "runtime" });
    expect(await paladin.ledger.lock("inst", "runtime").read()).toEqual({ pid: Deno.pid, process: "runtime" });
  });

  it("alive is true for a live pid, false after remove", async () => {
    expect(await paladin.ledger.lock("inst", "runtime").alive()).toBe(true);
    await paladin.ledger.lock("inst", "runtime").remove();
    expect(await paladin.ledger.lock("inst", "runtime").alive()).toBe(false);
  });

  it("alive is false for a dead pid", async () => {
    await paladin.ledger.lock("inst", "ghost").write({ pid: 2147483647, process: "ghost" });
    expect(await paladin.ledger.lock("inst", "ghost").alive()).toBe(false);
  });

  it("locks(slug) lists every lock in the slug with its process", async () => {
    await paladin.ledger.lock("multi", "runtime").write({ pid: Deno.pid });
    await paladin.ledger.lock("multi", "kajuit").write({ pid: Deno.pid });
    const listed = await paladin.ledger.locks("multi");
    expect(listed.map((entry) => entry.process).sort()).toEqual(["kajuit", "runtime"]);
  });

  it("locks(slug) returns [] for an unknown slug", async () => {
    expect(await paladin.ledger.locks("nobody")).toEqual([]);
  });
});

describe("Ledger.instances", () => {
  let paladin;
  beforeAll(async () => {
    paladin = await mkPaladin();
  });

  it("write stamps createdAt/updatedAt and read returns the entry", async () => {
    await paladin.ledger.instances.write("alpha", { mount: "/x" });
    const entry = await paladin.ledger.instances.read("alpha");
    expect(entry.mount).toBe("/x");
    expect(typeof entry.createdAt).toBe("string");
    expect(typeof entry.updatedAt).toBe("string");
  });

  it("second write merges, preserves createdAt", async () => {
    const first = await paladin.ledger.instances.read("alpha");
    await paladin.ledger.instances.write("alpha", { mount: "/y" });
    const second = await paladin.ledger.instances.read("alpha");
    expect(second.mount).toBe("/y");
    expect(second.createdAt).toBe(first.createdAt);
  });

  it("read returns null for an unknown slug", async () => {
    expect(await paladin.ledger.instances.read("ghost")).toBe(null);
  });
});

describe("Ledger.registry", () => {
  let paladin;
  beforeAll(async () => {
    paladin = await mkPaladin();
  });

  it("seed writes absolute locations from the registry scope and read round-trips", async () => {
    const registryRoot = await Deno.makeTempDir({ prefix: "paladin-registry-" });
    for (const slug of ["alpha", "beta"]) {
      await Deno.mkdir(`${registryRoot}/${slug}`);
      await Deno.writeTextFile(
        `${registryRoot}/${slug}/${slug}.viva.js`,
        `export const manifest = { owner: "@${slug}", type: "package", slug: "${slug}", version: "0.0.1" };`,
      );
    }
    const seeded = await paladin.ledger.registry.seed({ absolute: registryRoot });
    expect(seeded.sort()).toEqual([`${registryRoot}/alpha`, `${registryRoot}/beta`]);
    expect((await paladin.ledger.registry.read()).sort()).toEqual(seeded.sort());
  });

  it("read returns null before any seed", async () => {
    const fresh = await mkPaladin();
    expect(await fresh.ledger.registry.read()).toBe(null);
  });
});

describe("scope conventions — the ledger is the home", () => {
  it("registry store defaults to <ledger>/registry", async () => {
    const paladin = await mkPaladin();
    expect(paladin.scope.registry.absolute).toBe(paladin.scope.ledger.branch("registry").absolute);
  });

  it("VIVA_REGISTRY_MOUNT from paladin.env wins over the convention", async () => {
    const paladin = await mkPaladin();
    const explicit = await Deno.makeTempDir({ prefix: "paladin-store-" });
    paladin.env.set("VIVA_REGISTRY_MOUNT", explicit);
    expect(paladin.scope.registry.absolute).toBe(explicit);
  });

  it("VIVA_INSTANCE_MOUNT bare slug shelves under <ledger>/instances/", async () => {
    const paladin = await mkPaladin();
    paladin.env.set("VIVA_INSTANCE_MOUNT", "localhost");
    expect(paladin.scope.instance.absolute).toBe(
      paladin.scope.ledger.branch("instances/localhost").absolute,
    );
  });

  it("VIVA_INSTANCE_MOUNT absolute path stays verbatim", async () => {
    const paladin = await mkPaladin();
    const home = await Deno.makeTempDir({ prefix: "paladin-instance-" });
    paladin.env.set("VIVA_INSTANCE_MOUNT", home);
    expect(paladin.scope.instance.absolute).toBe(home);
  });
});

describe("Ledger.log", () => {
  let paladin;
  beforeAll(async () => {
    paladin = await mkPaladin();
  });

  it("append writes a jsonl span line readable via read.jsonl", async () => {
    await paladin.ledger.log("inst").append({ json: { event: "/turn/open" } });
    await paladin.ledger.log("inst").append({ json: { event: "/turn/close" } });
    const spans = await paladin.read.jsonl(paladin.scope.ledger.branch("/logs/inst/spans.jsonl"));
    expect(spans).toEqual([{ event: "/turn/open" }, { event: "/turn/close" }]);
  });

  it("open returns an appendable file handle for a child stream", async () => {
    const handle = await paladin.ledger.log("inst").open("runtime", "out");
    await handle.write(new TextEncoder().encode("hello\n"));
    handle.close();
    const text = await paladin.read.text(paladin.scope.ledger.branch("/logs/inst/runtime.out.log"));
    expect(text).toBe("hello\n");
  });
});
