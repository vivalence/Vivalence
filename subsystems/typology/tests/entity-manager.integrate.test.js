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

let scenario, connection, schema;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();

  const aperture = new Aperture();
  aperture.branch("/entities/mode").slurp(shard.datamap.repository(scenario.repos.mode));

  connection = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(shape.http(aperture)),
  );

  schema = shard.datamap.strip(scenario.orm.getMetadata());
});

specimen.afterAll(async () => {
  await scenario.orm.close();
  await new Promise((resolve) => setTimeout(resolve, 1100));
});

function mount(integrate) {
  const entityManager = new RemoteEntityManager(connection, schema);
  const repository = new RemoteRepository(TestMode).connect(connection.branch("/entities/mode"));
  entityManager.register("mode", repository, integrate);
  return entityManager;
}

specimen.describe("RemoteEntityManager.integrate", () => {
  specimen.it("a first sight installs, a re-sight only merges", async () => {
    let installCalls = 0;
    const entityManager = mount(async (entity) => {
      installCalls += 1;
      entity.installedAt = "first-sight";
    });

    const entity = await entityManager.integrate("mode", { id: "m-1", slug: "one" }, TestMode);
    const again = await entityManager.integrate("mode", { id: "m-1", slug: "two", name: "Updated" }, TestMode);
    specimen.expect(installCalls).toBe(1);
    specimen.expect(again).toBe(entity);
    specimen.expect(entity.slug).toBe("two");
    specimen.expect(entity.name).toBe("Updated");
    specimen.expect(entity.installedAt).toBe("first-sight");

    await entityManager.integrate("mode", { id: "m-1", slug: "third" }, TestMode);
    specimen.expect(installCalls).toBe(1);

    const installed = [];
    const independent = mount(async (sighted) => { installed.push(sighted.id); });
    await independent.integrate("mode", { id: "m-1", slug: "a" }, TestMode);
    await independent.integrate("mode", { id: "m-2", slug: "b" }, TestMode);
    await independent.integrate("mode", { id: "m-1", slug: "a2" }, TestMode);
    await independent.integrate("mode", { id: "m-2", slug: "b2" }, TestMode);
    specimen.expect(installed).toEqual(["m-1", "m-2"]);
  });

  specimen.it("an install hook shapes the entity before the store settles", async () => {
    let observed = null;
    const observing = mount(async (entity, raw) => { observed = { entity, raw }; });
    const result = await observing.integrate(
      "mode",
      { id: "m-1", slug: "test", traits: ["APPLICATION"] },
      TestMode,
    );
    specimen.expect(observed.entity).toBe(result);
    specimen.expect(observed.entity).toBeInstanceOf(TestMode);
    specimen.expect(observed.entity.implements("APPLICATION")).toBe(true);
    specimen.expect(observed.raw.slug).toBe("test");

    const delayed = mount(async (entity) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      entity.installed = true;
    });
    let published = null;
    delayed.stores.mode.subscribe((modes) => {
      if (modes.length) published = modes[modes.length - 1];
    });
    await delayed.integrate("mode", { id: "m-1", slug: "test" }, TestMode);
    specimen.expect(published.installed).toBe(true);

    const optional = mount(null);
    const bare = await optional.integrate("mode", { id: "m-1", slug: "test" }, TestMode);
    specimen.expect(bare).toBeInstanceOf(TestMode);
    specimen.expect(optional.identity("mode", "m-1")).toBe(bare);
  });

  specimen.it("a re-sight merges kindly and republishes the store", async () => {
    const guarded = mount(null);
    await guarded.integrate("mode", { id: "m-1", traits: ["APPLICATION", "EMITTER"] }, TestMode);
    await guarded.integrate("mode", { id: "m-1", traits: [] }, TestMode);
    specimen.expect(guarded.identity("mode", "m-1").traits).toEqual(["APPLICATION", "EMITTER"]);

    const selective = mount(null);
    const entity = await selective.integrate("mode", { id: "m-1", slug: "first", name: "First" }, TestMode);
    await selective.integrate("mode", { id: "m-1", name: undefined, slug: "second" }, TestMode);
    specimen.expect(entity.slug).toBe("second");
    specimen.expect(entity.name).toBe("First");

    const publishing = mount(async (installee) => { installee.enriched = true; });
    await publishing.integrate("mode", { id: "m-1", slug: "a" }, TestMode);
    const published = publishing.stores.mode.get();
    specimen.expect(published.length).toBe(1);
    specimen.expect(published[0].id).toBe("m-1");
    specimen.expect(published[0].enriched).toBe(true);

    const refreshing = mount(null);
    await refreshing.integrate("mode", { id: "m-1", slug: "first" }, TestMode);
    const before = refreshing.stores.mode.get();
    await refreshing.integrate("mode", { id: "m-1", slug: "second" }, TestMode);
    const after = refreshing.stores.mode.get();
    specimen.expect(after).not.toBe(before);
    specimen.expect(after[0]).toBe(before[0]);
    specimen.expect(after[0].slug).toBe("second");

    const anonymous = mount(null);
    const raw = { slug: "no-id" };
    specimen.expect(await anonymous.integrate("mode", raw, TestMode)).toBe(raw);
    specimen.expect(anonymous.stores.mode.get().length).toBe(0);
  });

  specimen.it("a back-reference never double-installs its parent", async () => {
    let modeInstalls = 0;
    const entityManager = new RemoteEntityManager(connection, schema);
    const modeRepository = new RemoteRepository(TestMode).connect(connection.branch("/entities/mode"));
    const intentRepository = new RemoteRepository(TestIntent).connect(connection.branch("/entities/mode"));
    entityManager.register("mode", modeRepository, async () => { modeInstalls += 1; });
    entityManager.register("intent", intentRepository, null);

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

    let concurrentInstalls = 0;
    const concurrent = mount(async () => { concurrentInstalls += 1; });
    await Promise.all([
      concurrent.integrate("mode", { id: "m-con", slug: "a" }, TestMode),
      concurrent.integrate("mode", { id: "m-con", slug: "b" }, TestMode),
      concurrent.integrate("mode", { id: "m-con", slug: "c" }, TestMode),
    ]);
    specimen.expect(concurrentInstalls).toBe(1);
  });
});
