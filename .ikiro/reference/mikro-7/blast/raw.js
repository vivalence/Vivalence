import { EntitySchema, types, raw } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/sqlite";

class LiteralEntity {}
const Literal = new EntitySchema({
  class: LiteralEntity,
  tableName: "Literal",
  properties: { id: { type: types.integer, primary: true }, traits: { type: types.json, nullable: true } },
});

const orm = await MikroORM.init({ dbName: ":memory:", entities: [Literal] });
await orm.schema.create();
const em = orm.em.fork();
em.create(LiteralEntity, { traits: ["KNOWN"] });
em.create(LiteralEntity, { traits: ["LEARNING"] });
await em.flush();

const attempt = async (label, run) => {
  try {
    console.log(label, "->", JSON.stringify(await run()));
  } catch (error) {
    console.log(label, "-> THREW", error.message.split("\n")[0]);
  }
};

await attempt("orderBy raw random() alone", async () => (await em.fork().find(LiteralEntity, {}, { orderBy: { [raw("random()")]: "asc" } })).length);
await attempt("findOne orderBy raw random() alone", async () => !!(await em.fork().findOne(LiteralEntity, {}, { orderBy: { [raw("random()")]: "asc" } })));
const column = "`l0`.traits";
const has = (trait) => ({ [raw(`${column} LIKE ?`, [`%${trait}%`])]: [] });
const hasNot = (trait) => ({ [raw(`${column} NOT LIKE ?`, [`%${trait}%`])]: [] });
await attempt("where $and [raw LIKE key]", async () => (await em.fork().find(LiteralEntity, { $and: [has("KNOWN")] })).map((row) => row.id));
await attempt("where $and [raw NOT LIKE key]", async () => (await em.fork().find(LiteralEntity, { $and: [hasNot("KNOWN")] })).map((row) => row.id));
await attempt("where spread {...has}", async () => (await em.fork().find(LiteralEntity, { ...has("LEARNING") })).map((row) => row.id));
await attempt("metadata.get('LiteralEntity')", async () => orm.getMetadata().get("LiteralEntity").tableName);
await attempt("metadata.find('LiteralEntity')", async () => orm.getMetadata().find("LiteralEntity")?.tableName);
await attempt("metadata.has('LiteralEntity')", async () => orm.getMetadata().has("LiteralEntity"));
await attempt("getAll() instanceof Map", async () => orm.getMetadata().getAll() instanceof Map);
await attempt("repository.entityName", async () => typeof em.getRepository(LiteralEntity).getEntityName?.() + " / " + typeof em.getRepository(LiteralEntity).entityName);
await orm.close();
