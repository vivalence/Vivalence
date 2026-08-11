import {
  specimen, Aperture, Connection, Url,
  shard, shape, RemoteEntityManager, RemoteRepository,
} from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";

let scenario, connection, schema;

specimen.beforeAll(async () => {
  scenario = await datamap.seed();

  const aperture = new Aperture();
  aperture.branch("/literal").slurp(shard.datamap.repository(scenario.repos.literal));
  aperture.branch("/symbol").slurp(shard.datamap.repository(scenario.repos.symbol));
  aperture.branch("/mode").slurp(shard.datamap.repository(scenario.repos.mode));
  aperture.branch("/intent").slurp(shard.datamap.repository(scenario.repos.intent));

  connection = new Connection(
    new Url("http://test"),
    shard.transmitter.inline(shape.http(aperture)),
  );

  schema = shard.datamap.strip(scenario.orm.getMetadata());
});

specimen.afterAll(async () => {
  await scenario.orm.close();
});

specimen.describe("RemoteRepository", () => {
  specimen.it("a repository speaks crud over the wire", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    const literals = entityManager.register("literal", new RemoteRepository().connect(connection.branch("/literal")));
    const modes = entityManager.register("mode", new RemoteRepository().connect(connection.branch("/mode")));

    const results = await literals.find({ slug: "hello" });
    specimen.expect(results[0].slug).toBe("hello");
    specimen.expect(literals.$entities.get().length).toBeGreaterThan(0);

    const local = await literals.findOne({ slug: "hello" });
    specimen.expect(local.slug).toBe("hello");

    const freshManager = new RemoteEntityManager(connection, schema);
    const freshLiterals = freshManager.register("literal", new RemoteRepository().connect(connection.branch("/literal")));
    const fetched = await freshLiterals.findOne({ slug: "hello" });
    specimen.expect(fetched.slug).toBe("hello");

    specimen.expect(await literals.findOne({ slug: "doesnt-exist-at-all" })).toBeNull();

    const [entities, count] = await literals.findAndCount({});
    specimen.expect(count).toBeGreaterThan(0);
    specimen.expect(entities.length).toBe(count);

    const counted = await literals.count({});
    specimen.expect(typeof counted).toBe("number");
    specimen.expect(counted).toBeGreaterThan(0);

    const created = await literals.create({ slug: "repo-create", trait: {} });
    specimen.expect(literals.$entities.get()).toContain(created);

    const ensured = await modes.ensure({ slug: "repo-ensure", type: "test", traits: [], installed: false });
    specimen.expect(ensured.slug).toBe("repo-ensure");
    specimen.expect(modes.$entities.get()).toContain(ensured);

    const mutable = await literals.create({ slug: "repo-mut", trait: {} });
    const updated = await literals.updateOne({ id: mutable.id }, { trait: { X: 1 } });
    specimen.expect(updated).toBe(mutable);
    specimen.expect(updated.trait.X).toBe(1);

    const doomed = await literals.create({ slug: "repo-rm", trait: {} });
    const before = literals.$entities.get().length;
    await literals.removeOne({ id: doomed.id });
    specimen.expect(literals.$entities.get().length).toBe(before - 1);
  });

  specimen.it("a prototype wraps what crosses the wire", async () => {
    class Literal { constructor(data) { Object.assign(this, data); } }
    const entityManager = new RemoteEntityManager(connection, schema);
    const typed = entityManager.register("literal", new RemoteRepository(Literal).connect(connection.branch("/literal")));

    const results = await typed.find({ slug: "hello" });
    specimen.expect(results[0]).toBeInstanceOf(Literal);

    const created = await typed.create({ slug: "proto-create", trait: {} });
    specimen.expect(created).toBeInstanceOf(Literal);
  });

  specimen.it("a store keeps one identity per id", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    const store = entityManager.register("test", new RemoteRepository().connect(connection.branch("/literal")));

    const first = await store.merge({ id: "1", slug: "a", enriched: "yes" });
    const second = await store.merge({ id: "1", slug: "b" });
    specimen.expect(first).toBe(second);
    specimen.expect(first.slug).toBe("b");
    specimen.expect(first.enriched).toBe("yes");
    specimen.expect(store.$entities.get().length).toBe(1);

    await store.merge({ id: "2", slug: "b" });
    specimen.expect(store.$entities.get().length).toBe(2);

    specimen.expect(await store.merge(null)).toBeNull();

    store.drop("1");
    specimen.expect(store.$entities.get().length).toBe(1);
    specimen.expect(store.$entities.get()[0].id).toBe("2");

    const seen = [];
    const observing = new RemoteEntityManager(connection, schema);
    const observed = observing.register(
      "test",
      new RemoteRepository().connect(connection.branch("/literal")),
      async (entity, raw) => seen.push({ entity, raw }),
    );
    const merged = await observed.merge({ id: "1", slug: "a" });
    specimen.expect(seen.length).toBe(1);
    specimen.expect(seen[0].entity).toBe(merged);
    specimen.expect(seen[0].raw.slug).toBe("a");
    await observed.merge({ id: "1", slug: "b" });
    await observed.merge({ id: "1", slug: "c" });
    specimen.expect(seen.length).toBe(1);
  });

  specimen.it("a cast hydrates relations through the manager", async () => {
    const entityManager = new RemoteEntityManager(connection, schema);
    const modes = entityManager.register("mode", new RemoteRepository().connect(connection.branch("/mode")));
    const intents = entityManager.register("intent", new RemoteRepository().connect(connection.branch("/intent")));

    const mode = await modes.merge({ id: "m1", slug: "flashcard" });
    const intent = await intents.cast({ id: "i1", slug: "greet", mode: { id: "m1", slug: "flashcard" } });
    specimen.expect(intent.mode).toBe(mode);

    const child = await intents.merge({ id: "i-child", slug: "a" });
    const parent = await modes.cast({ id: "m2", intents: [{ id: "i-child", slug: "a" }, { id: "i2", slug: "b" }] });
    specimen.expect(parent.intents[0]).toBe(child);
    specimen.expect(parent.intents[1].id).toBe("i2");

    const nullish = await modes.cast({ id: "1", mode: null });
    specimen.expect(nullish.mode).toBeNull();
  });
});
