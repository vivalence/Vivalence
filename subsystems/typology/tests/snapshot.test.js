import { specimen } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;

// a fake MikroORM Collection — what fold must fold to its item ids.
const collection = (items, initialized = true) => ({
  isInitialized: () => initialized,
  getItems: () => items,
});

describe("specimen.snapshot", () => {
  // ── fold: the cata leaf rules ──────────────────────────────────────
  it("passes scalars through, ISO-stamps Dates, stringifies BigInt", () => {
    const { pojo } = snapshot(
      { name: "hello", n: 7, ok: true, at: new Date("2020-01-02T03:04:05.000Z"), big: 9n },
      { locate: "/dev/null", write: false },
    );
    expect(pojo).toEqual({ name: "hello", n: 7, ok: true, at: "2020-01-02T03:04:05.000Z", big: "9" });
  });

  it("folds a loaded Collection to item ids", () => {
    const { pojo } = snapshot(
      { uses: collection([{ id: "a" }, { id: "b" }]) },
      { locate: "/dev/null", write: false },
    );
    expect(pojo.uses).toEqual(["a", "b"]);
  });

  it("marks an unloaded Collection", () => {
    const { pojo } = snapshot(
      { uses: collection([], false) },
      { locate: "/dev/null", write: false },
    );
    expect(pojo.uses).toBe("[unloaded]");
  });

  it("cuts the circular spine at depth, entity → id", () => {
    const { pojo } = snapshot(
      { id: "root", child: { id: "c1", child: { id: "c2", child: { id: "c3" } } } },
      { locate: "/dev/null", write: false, depth: 2 },
    );
    // depth 2: root → child(c1) → child(c2 at floor → id only)
    expect(pojo).toEqual({ id: "root", child: { id: "c1", child: "c2" } });
  });

  it("sheds noise: $-stores, methods, em, daemon back-refs", () => {
    const { pojo } = snapshot(
      { slug: "keep", $atom: { get() {} }, method: () => 1, em: {}, daemon: {} },
      { locate: "/dev/null", write: false },
    );
    expect(pojo).toEqual({ slug: "keep" });
  });

  // ── knobs: pick · locate · write ───────────────────────────────────
  it("pick allowlists top-level fields", () => {
    const { pojo } = snapshot(
      { a: 1, b: 2, c: 3 },
      { locate: "/dev/null", write: false, pick: ["a", "c"] },
    );
    expect(pojo).toEqual({ a: 1, c: 3 });
  });

  it("omit blocklists top-level fields — pick's dual", () => {
    const { pojo } = snapshot(
      { a: 1, b: 2, cake: { huge: true } },
      { locate: "/dev/null", write: false, omit: ["cake"] },
    );
    expect(pojo).toEqual({ a: 1, b: 2 });
  });

  it("uses a string locate verbatim", () => {
    const { path } = snapshot({ a: 1 }, { locate: "/tmp/x.json", write: false });
    expect(path).toBe("/tmp/x.json");
  });

  it("calls a function locate with (meta, pojo)", () => {
    let seen;
    const { path } = snapshot(
      { slug: "hello" },
      {
        write: false,
        meta: { type: "literal", vantage: "runtime" },
        locate: (meta, pojo) => {
          seen = { meta, pojo };
          return `/snap/${meta.type}.${pojo.slug}.${meta.vantage}.json`;
        },
      },
    );
    expect(path).toBe("/snap/literal.hello.runtime.json");
    expect(seen.meta).toEqual({ type: "literal", vantage: "runtime" });
    expect(seen.pojo).toEqual({ slug: "hello" });
  });

  it("base resolves a relative locate; an absolute locate passes through", () => {
    const rel = snapshot({ a: 1 }, { write: false, base: "/root/snaps", locate: "mode.daemon.json" });
    expect(rel.path).toBe("/root/snaps/mode.daemon.json");
    const abs = snapshot({ a: 1 }, { write: false, base: "/root/snaps", locate: "/elsewhere/y.json" });
    expect(abs.path).toBe("/elsewhere/y.json");
  });

  it("dry mode resolves pojo + path but writes nothing", () => {
    const file = Deno.makeTempFileSync({ suffix: ".json" });
    Deno.removeSync(file); // ensure the target is absent
    const { pojo, path } = snapshot({ a: 1 }, { locate: file, dry: true });
    expect(pojo).toEqual({ a: 1 });
    expect(path).toBe(file);
    expect(() => Deno.statSync(file)).toThrow(); // nothing landed on disk
  });

  it("throws when WRITING with no resolved path", () => {
    expect(() => snapshot({ a: 1 }, {})).toThrow("locate must resolve");
    expect(() => snapshot({ a: 1 }, { locate: "" })).toThrow("locate must resolve");
    expect(() => snapshot({ a: 1 }, { locate: () => undefined })).toThrow("locate must resolve");
  });

  it("write:false needs no path — returns the POJO, touches no disk", () => {
    const { pojo, path } = snapshot({ a: 1 }, { write: false });
    expect(pojo).toEqual({ a: 1 });
    expect(path).toBeUndefined();
  });

  // ── cata to disk ───────────────────────────────────────────────────
  it("writes the POJO as pretty JSON, round-trips on read", () => {
    const file = Deno.makeTempFileSync({ suffix: ".json" });
    try {
      const { pojo, path } = snapshot(
        { slug: "água", at: new Date("2021-06-01T00:00:00.000Z"), uses: collection([{ id: "x" }]) },
        { locate: file },
      );
      expect(path).toBe(file);
      const onDisk = JSON.parse(Deno.readTextFileSync(file));
      expect(onDisk).toEqual(pojo);
      expect(onDisk).toEqual({ slug: "água", at: "2021-06-01T00:00:00.000Z", uses: ["x"] });
    } finally {
      Deno.removeSync(file);
    }
  });
});
