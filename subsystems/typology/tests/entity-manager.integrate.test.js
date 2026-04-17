import {
  specimen, Aperture, Connection, Url,
  shard, shape, RemoteEntityManager, RemoteRepository,
} from "@vivalence/typology";
import { datamap } from "@vivalence/typology/scenarios";

class TestIntent {
  constructor(data) { Object.assign(this, data); }
}

class TestMode {
  constructor(data) { Object.assign(this, data); }
  implements(trait) { return this.traits?.includes(trait); }
  toJSON() {
    const out = {};
    for (const [key, value] of Object.entries(this)) {
      if (typeof value === "function") continue;
      if (value instanceof Set || value instanceof Map) continue;
      out[key] = value;
    }
    return out;
  }
}

let scenario, conn, schema;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();
  const { repos } = scenario;

  const aperture = new Aperture();
  aperture.branch("/entities/mode").slurp(shard.datamap.repository(repos.mode));

  conn = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(shape.http(aperture)),
  );

  schema = shard.datamap.strip(scenario.orm.getMetadata());
});

specimen.afterAll(async () => {
  await scenario.orm.close();
  await new Promise((r) => setTimeout(r, 1100));
});

function mount(integrate) {
  const entityManager = new RemoteEntityManager(conn, schema);
  const repo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
  entityManager.register("mode", repo, integrate);
  return entityManager;
}

specimen.describe("RemoteEntityManager.integrate", () => {

  specimen.describe("identity gate", () => {
    specimen.it("install runs exactly once for a given id", async () => {
      let installCalls = 0;
      const em = mount(async () => { installCalls += 1; });

      await em.integrate("mode", { id: "m-1", slug: "test" }, TestMode);
      await em.integrate("mode", { id: "m-1", slug: "updated" }, TestMode);
      await em.integrate("mode", { id: "m-1", slug: "third" }, TestMode);

      specimen.expect(installCalls).toBe(1);
    });

    specimen.it("returns same reference on re-sight", async () => {
      const em = mount(null);
      const first = await em.integrate("mode", { id: "m-1", slug: "test" }, TestMode);
      const second = await em.integrate("mode", { id: "m-1", slug: "updated" }, TestMode);
      specimen.expect(first).toBe(second);
    });

    specimen.it("re-sight merges fields without re-installing", async () => {
      let installCalls = 0;
      const em = mount(async (entity) => {
        installCalls += 1;
        entity.installedAt = "first-sight";
      });

      const entity = await em.integrate("mode", { id: "m-1", slug: "one" }, TestMode);
      await em.integrate("mode", { id: "m-1", slug: "two", name: "Updated" }, TestMode);

      specimen.expect(installCalls).toBe(1);
      specimen.expect(entity.slug).toBe("two");
      specimen.expect(entity.name).toBe("Updated");
      specimen.expect(entity.installedAt).toBe("first-sight");
    });

    specimen.it("different ids install independently", async () => {
      const installed = [];
      const em = mount(async (entity) => { installed.push(entity.id); });

      await em.integrate("mode", { id: "m-1", slug: "a" }, TestMode);
      await em.integrate("mode", { id: "m-2", slug: "b" }, TestMode);
      await em.integrate("mode", { id: "m-1", slug: "a2" }, TestMode);
      await em.integrate("mode", { id: "m-2", slug: "b2" }, TestMode);

      specimen.expect(installed).toEqual(["m-1", "m-2"]);
    });
  });

  specimen.describe("install contract", () => {
    specimen.it("receives live entity and raw pojo", async () => {
      let observed = null;
      const em = mount(async (entity, raw) => { observed = { entity, raw }; });

      const result = await em.integrate(
        "mode",
        { id: "m-1", slug: "test", traits: ["BUFFERED"] },
        TestMode,
      );

      specimen.expect(observed.entity).toBe(result);
      specimen.expect(observed.entity).toBeInstanceOf(TestMode);
      specimen.expect(observed.entity.implements("BUFFERED")).toBe(true);
      specimen.expect(observed.raw.slug).toBe("test");
    });

    specimen.it("awaits async install before publishing to store", async () => {
      const em = mount(async (entity) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        entity.installed = true;
      });

      let published = null;
      em.stores.mode.subscribe((modes) => {
        if (modes.length) published = modes[modes.length - 1];
      });

      await em.integrate("mode", { id: "m-1", slug: "test" }, TestMode);
      specimen.expect(published.installed).toBe(true);
    });

    specimen.it("install is optional — entity installs without it", async () => {
      const em = mount(null);
      const entity = await em.integrate("mode", { id: "m-1", slug: "test" }, TestMode);
      specimen.expect(entity).toBeInstanceOf(TestMode);
      specimen.expect(em.identity("mode", "m-1")).toBe(entity);
    });
  });

  specimen.describe("merge semantics on re-sight", () => {
    specimen.it("does not overwrite populated arrays with empty arrays", async () => {
      const em = mount(null);
      await em.integrate("mode", { id: "m-1", traits: ["BUFFERED", "EMITTER"] }, TestMode);
      await em.integrate("mode", { id: "m-1", traits: [] }, TestMode);
      specimen.expect(em.identity("mode", "m-1").traits).toEqual(["BUFFERED", "EMITTER"]);
    });

    specimen.it("skips undefined fields, assigns defined ones", async () => {
      const em = mount(null);
      const entity = await em.integrate("mode", { id: "m-1", slug: "first", name: "First" }, TestMode);
      await em.integrate("mode", { id: "m-1", name: undefined, slug: "second" }, TestMode);
      specimen.expect(entity.slug).toBe("second");
      specimen.expect(entity.name).toBe("First");
    });
  });

  specimen.describe("publication", () => {
    specimen.it("publishes new entity to reactive store after install", async () => {
      const em = mount(async (entity) => { entity.enriched = true; });
      await em.integrate("mode", { id: "m-1", slug: "a" }, TestMode);
      const published = em.stores.mode.get();
      specimen.expect(published.length).toBe(1);
      specimen.expect(published[0].id).toBe("m-1");
      specimen.expect(published[0].enriched).toBe(true);
    });

    specimen.it("re-sight refreshes store reference (nanostore emit)", async () => {
      const em = mount(null);
      await em.integrate("mode", { id: "m-1", slug: "first" }, TestMode);
      const before = em.stores.mode.get();

      await em.integrate("mode", { id: "m-1", slug: "second" }, TestMode);
      const after = em.stores.mode.get();

      specimen.expect(after).not.toBe(before);
      specimen.expect(after[0]).toBe(before[0]);
      specimen.expect(after[0].slug).toBe("second");
    });
  });

  specimen.describe("degenerate inputs", () => {
    specimen.it("returns raw when id is missing", async () => {
      const em = mount(null);
      const raw = { slug: "no-id" };
      const result = await em.integrate("mode", raw, TestMode);
      specimen.expect(result).toBe(raw);
      specimen.expect(em.stores.mode.get().length).toBe(0);
    });
  });

  specimen.describe("back-reference race", () => {
    // A 1:m array whose children back-reference the parent via m:1 must not
    // cause the parent's install to fire more than once. Pre-fix: em.cast
    // awaits Promise.all(children.map(resolve)) before the parent merge,
    // so every nested integrate on the parent id sees fresh=true and
    // re-fires install.
    specimen.it("install fires exactly once when children back-reference the parent", async () => {
      let modeInstalls = 0;
      const entityManager = new RemoteEntityManager(conn, schema);
      const modeRepo = new RemoteRepository(TestMode).connect(conn.branch("/entities/mode"));
      const intentRepo = new RemoteRepository(TestIntent).connect(conn.branch("/entities/mode"));
      entityManager.register("mode", modeRepo, async () => { modeInstalls += 1; });
      entityManager.register("intent", intentRepo, null);

      await entityManager.integrate("mode", {
        id: "m-race",
        slug: "race",
        intents: [
          { id: "i-1", slug: "a", mode: { id: "m-race" } },
          { id: "i-2", slug: "b", mode: { id: "m-race" } },
          { id: "i-3", slug: "c", mode: { id: "m-race" } },
        ],
      }, TestMode);

      specimen.expect(modeInstalls).toBe(1);
    });

    specimen.it("concurrent integrate of the same id installs once", async () => {
      let installs = 0;
      const em = mount(async () => { installs += 1; });

      await Promise.all([
        em.integrate("mode", { id: "m-con", slug: "a" }, TestMode),
        em.integrate("mode", { id: "m-con", slug: "b" }, TestMode),
        em.integrate("mode", { id: "m-con", slug: "c" }, TestMode),
      ]);

      specimen.expect(installs).toBe(1);
    });
  });
});
