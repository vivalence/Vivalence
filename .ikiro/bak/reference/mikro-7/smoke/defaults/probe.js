import { EntitySchema, types } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/sqlite";

const [database, shape, verb] = Deno.args;
const pinned = shape === "pinned";
const pivots = shape !== "bare";

class ModeEntity {}
class TurnEntity {}
class SymbolEntity {}
class LiteralEntity {}

const Mode = new EntitySchema({ class: ModeEntity, tableName: "Mode", properties: { id: { type: types.string, primary: true } } });
const Turn = new EntitySchema({
  class: TurnEntity,
  tableName: "Turn",
  properties: {
    id: { type: types.string, primary: true },
    parent: { kind: "m:1", entity: () => TurnEntity, fieldName: "parent", nullable: true, ...(pinned && { updateRule: "cascade", deleteRule: "set null" }) },
    mode: { kind: "m:1", entity: () => ModeEntity, fieldName: "mode", updateRule: "cascade", deleteRule: "cascade" },
  },
});
const Symbol = new EntitySchema({
  class: SymbolEntity,
  tableName: "Symbol",
  properties: {
    id: { type: types.string, primary: true },
    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: "symbols",
      ...(pivots && { pivotTable: "symbol_literals", joinColumns: ["symbol_entity_id"], inverseJoinColumns: ["literal_entity_id"] }),
    },
  },
});
const Literal = new EntitySchema({
  class: LiteralEntity,
  tableName: "Literal",
  properties: {
    id: { type: types.string, primary: true },
    symbols: { kind: "m:n", entity: () => SymbolEntity, mappedBy: "literals" },
    uses: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: "in",
      ...(pivots && { pivotTable: "literal_uses", joinColumns: ["literal_entity_1_id"], inverseJoinColumns: ["literal_entity_2_id"] }),
    },
    in: { kind: "m:n", entity: () => LiteralEntity, mappedBy: "uses" },
  },
});

const orm = await MikroORM.init({ dbName: database, entities: [Mode, Turn, Symbol, Literal] });
const connection = orm.em.getConnection();
const census = async () => {
  const tables = await connection.execute("select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name");
  const rows = {};
  for (const { name } of tables) rows[name] = (await connection.execute(`select count(*) as n from \`${name}\``))[0].n;
  return rows;
};

if (verb === "diff") console.log((await orm.schema.getUpdateSchemaSQL({ wrap: false })) || "(no diff)");
if (verb === "apply") {
  console.log("before", JSON.stringify(await census()));
  try {
    await orm.schema.update();
    console.log("after ", JSON.stringify(await census()));
  } catch (error) {
    console.log("update threw:", error.message.split("\n")[0]);
    console.log("after ", JSON.stringify(await census()));
  }
}
if (verb === "delete") {
  console.log("foreign_keys", JSON.stringify(await connection.execute("pragma foreign_keys")));
  try {
    await connection.execute("delete from `Turn` where `id` = 't2'");
    console.log("delete t2 ok, rows:", JSON.stringify(await connection.execute("select id, parent from `Turn` order by id")));
  } catch (error) {
    console.log("delete t2 threw:", error.message.split("\n")[0]);
  }
}
await orm.close();
