import { assertEquals } from "@std/assert";
import { seed } from "./scenarios/datamap.js";

const PIVOTS = {
  symbol_literals: ["symbol_entity_id", "literal_entity_id"],
  literal_uses: ["literal_entity_1_id", "literal_entity_2_id"],
  buffer_literals: ["buffer_entity_id", "literal_entity_id"],
  buffer_symbols: ["buffer_entity_id", "symbol_entity_id"],
};

Deno.test("schema.names — the join tables keep their v6 names and columns", async (t) => {
  const { orm } = await seed();
  const connection = orm.em.getConnection();

  for (const [table, columns] of Object.entries(PIVOTS)) {
    await t.step(`${table} joins ${columns.join(" · ")}`, async () => {
      const described = await connection.execute(`pragma table_info(${table})`);
      assertEquals(described.map((column) => column.name), columns);
    });
  }

  await orm.close();
});
