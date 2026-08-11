import { assert, assertEquals } from "@std/assert";
import { shard, steer, ToolCall, Vector } from "@vivalence/typology";
import { seed } from "./scenarios/datamap.js";
import * as skills from "../daemon/skills/index.js";

const harness = (entities) =>
  new Vector().use(shard.context.bind("daemon", { entities })).slurp(skills.entity);

const invoke = (armed, name, input) =>
  steer.dispatch.invoke(armed, new ToolCall(name).signal, steer.strategy.guarded)(input);

Deno.test("skill.entity — the generic entity trio", async (t) => {
  const { orm, em, repos } = await seed();
  const entities = { em, ...repos };
  const armed = harness(entities);

  await t.step("schema without arguments lists every entity with counts and cards", async () => {
    const spoken = await invoke(armed, "entity_schema", {});
    const literal = spoken.output.entities.find((row) => row.type === "literal");
    assertEquals(literal.rows, 2);
    assert(literal.card.includes("slug"));
    assert(spoken.output.entities.some((row) => row.type === "symbol"));
  });

  await t.step("schema with an entity describes columns and operators", async () => {
    const spoken = await invoke(armed, "entity_schema", { entity: "literal" });
    assertEquals(spoken.output.schema.columns.slug, "string");
    assert(spoken.output.schema.operators.includes("$in"));
    assert(spoken.output.schema.extensions.traits);
  });

  await t.step("find returns cards, total and pages with offset", async () => {
    const first = await invoke(armed, "entity_find", { entity: "literal", limit: 1 });
    assertEquals(first.output.literal.length, 1);
    assertEquals(first.output.total, 2);
    assertEquals(first.output.next.offset, 1);
    assert(first.output.literal[0].slug);
    assertEquals(first.output.literal[0].trait, undefined);

    const second = await invoke(armed, "entity_find", {
      entity: "literal",
      limit: 1,
      offset: first.output.next.offset,
    });
    assertEquals(second.output.next, undefined);
    assert(second.output.literal[0].slug !== first.output.literal[0].slug);
  });

  await t.step("find with fields full returns rows", async () => {
    const spoken = await invoke(armed, "entity_find", {
      entity: "literal",
      fields: "full",
      where: { slug: "hello" },
    });
    assertEquals(spoken.output.literal.length, 1);
    assert("trait" in spoken.output.literal[0]);
  });

  await t.step("count counts without loading", async () => {
    const spoken = await invoke(armed, "entity_count", {
      entity: "literal",
      where: { slug: { $like: "%o%" } },
    });
    assertEquals(spoken.output.count, 2);
  });

  await t.step("an unknown entity answers with the available types", async () => {
    const spoken = await invoke(armed, "entity_find", { entity: "litreal" });
    assertEquals(spoken.condition, "ERROR");
    assert(spoken.output.message.includes("litreal"));
    assert(spoken.output.message.includes("literal"));
  });

  await orm.close();
});
