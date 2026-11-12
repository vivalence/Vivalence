import { assert, assertEquals } from "@std/assert";
import { contexts, shard, steer, ToolCall, Vector } from "@vivalence/typology";
import { seed } from "./scenarios/datamap.js";
import { ActivityEntity, ActivityRepository, gestalten, UserEntity } from "@vivalence/runtime";

const harness = (entities) =>
  new Vector().use(shard.context.spread(contexts.daemonDie, { entities })).graft(gestalten.tools.entity);

const invoke = (armed, name, input) =>
  steer.dispatch.invoke(armed, new ToolCall(name).signal, steer.strategy.guarded)(input);

Deno.test("skill.entity — the generic entity trio", async (t) => {
  const { orm, em, repos } = await seed();
  const entities = { em, ...repos };
  const armed = harness(entities);

  await t.step("schema without arguments lists every entity with counts and cards", async () => {
    const spoken = await invoke(armed, "entity_schema", {});
    const literal = spoken.product.entities.find((row) => row.type === "literal");
    assertEquals(literal.rows, 2);
    assert(literal.card.includes("slug"));
    assert(spoken.product.entities.some((row) => row.type === "symbol"));
  });

  await t.step("schema with an entity describes columns and operators", async () => {
    const spoken = await invoke(armed, "entity_schema", { entity: "literal" });
    assertEquals(spoken.product.schema.columns.slug, "string");
    assert(spoken.product.schema.operators.includes("$in"));
    assert(spoken.product.schema.extensions.traits);
  });

  await t.step("find returns cards, total and pages with offset", async () => {
    const first = await invoke(armed, "entity_find", { entity: "literal", limit: 1 });
    assertEquals(first.product.literal.length, 1);
    assertEquals(first.product.total, 2);
    assertEquals(first.product.next.offset, 1);
    assert(first.product.literal[0].slug);
    assertEquals(first.product.literal[0].trait, undefined);

    const second = await invoke(armed, "entity_find", {
      entity: "literal",
      limit: 1,
      offset: first.product.next.offset,
    });
    assertEquals(second.product.next, undefined);
    assert(second.product.literal[0].slug !== first.product.literal[0].slug);
  });

  await t.step("find with fields full returns rows", async () => {
    const spoken = await invoke(armed, "entity_find", {
      entity: "literal",
      fields: "full",
      where: { slug: "hello" },
    });
    assertEquals(spoken.product.literal.length, 1);
    assert("trait" in spoken.product.literal[0]);
  });

  await t.step("count counts without loading", async () => {
    const spoken = await invoke(armed, "entity_count", {
      entity: "literal",
      where: { slug: { $like: "%o%" } },
    });
    assertEquals(spoken.product.count, 2);
  });

  await t.step("an unknown entity answers with the available types", async () => {
    const spoken = await invoke(armed, "entity_find", { entity: "litreal" });
    assertEquals(spoken.condition, "ERROR");
    assert(spoken.product.message.includes("litreal"));
    assert(spoken.product.message.includes("literal"));
  });

  await t.step("update merges a trait patch deep over the held data and names the trait", async () => {
    await invoke(armed, "entity_update", {
      entity: "literal",
      where: { slug: "hello" },
      trait: { TRANSLATED: { known: "hello", learning: "hola" } },
    });
    const spoken = await invoke(armed, "entity_update", {
      entity: "literal",
      where: { slug: "hello" },
      trait: { TRANSLATED: { learning: "buenas" } },
    });
    assertEquals(spoken.product.message, "updated literal hello");
    assertEquals(spoken.product.literal[0].trait.TRANSLATED, { known: "hello", learning: "buenas" });
    assertEquals(spoken.product.literal[0].traits, ["TRANSLATED"]);
    em.clear();
    const stored = await repos.literal.findOneOrFail({ slug: "hello" });
    assertEquals(stored.trait.TRANSLATED, { known: "hello", learning: "buenas" });
    const untouched = await repos.literal.findOneOrFail({ slug: "goodbye" });
    assertEquals(untouched.traits, []);
  });

  await t.step("update on an unknown entity answers with the available types", async () => {
    const spoken = await invoke(armed, "entity_update", { entity: "litreal", where: {}, trait: {} });
    assertEquals(spoken.condition, "ERROR");
    assert(spoken.product.message.includes("litreal"));
  });

  await orm.close();
});

Deno.test("skill.entity — a bound user reads only their own user row and activities", async (t) => {
  const { orm, em, repos, fixtures } = await seed();
  const intruder = em.create(UserEntity, { slug: "intruder" });
  await em.flush();
  const activity = new ActivityRepository(em, ActivityEntity);
  await activity.create({ user: fixtures.user.id });
  await activity.create({ user: intruder.id });
  await activity.create({ user: null });
  const armed = harness({ em, ...repos, activity });

  await t.step("entity_find user answers the bound user alone", async () => {
    const spoken = await invoke(armed, "entity_find", { entity: "user", fields: "full" });
    assertEquals(spoken.product.user.map((row) => row.slug), ["beef"]);
    assertEquals(spoken.product.total, 1);
  });

  await t.step("entity_find activity answers the bound user's runs and the system's, never another user's", async () => {
    const spoken = await invoke(armed, "entity_find", { entity: "activity", fields: "full" });
    assertEquals(spoken.product.activity.map((row) => row.user), [fixtures.user.id, null]);
    assertEquals(spoken.product.total, 2);
  });

  await t.step("a where naming another user cannot widen the scope", async () => {
    const spoken = await invoke(armed, "entity_find", { entity: "activity", where: { user: intruder.id } });
    assertEquals(spoken.product.total, 0);
  });

  await t.step("another user's run is not found by id", async () => {
    const [theirs] = activity.$entities.get().filter((row) => (row.user?.id ?? row.user) === intruder.id);
    assertEquals(await activity.findOne({ id: theirs.id }), null);
  });

  await t.step("a lookup across users says so — the signer's — and reads every user", async () => {
    assertEquals((await repos.user.find({}, { filters: { user: false } })).map((row) => row.slug).sort(), ["beef", "intruder"]);
  });

  await t.step("with no user bound, every run is read", async () => {
    em.setFilterParams("user", undefined);
    assertEquals((await activity.find({})).length, 3);
  });

  await orm.close();
});
