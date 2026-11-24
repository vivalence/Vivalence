import { EntitySchema, types, Cascade } from "@mikro-orm/core";
import { MikroORM, SqliteDriver, NodeSqliteDialect } from "@mikro-orm/sql";
class Author {}
class Book {}
const AuthorSchema = new EntitySchema({ class: Author, properties: {
  id: { type: types.integer, primary: true }, name: { type: types.string },
  mentor: { kind: "m:1", entity: () => Author, nullable: true },
}});
const BookSchema = new EntitySchema({ class: Book, properties: {
  id: { type: types.integer, primary: true }, title: { type: types.string },
  author: { kind: "m:1", entity: () => Author },
  owner: { kind: "m:1", entity: () => Author, nullable: true, cascade: [Cascade.ALL] },
}});
const db = Deno.args[0];
const orm = await MikroORM.init({ driver: SqliteDriver, dbName: db, driverOptions: new NodeSqliteDialect(db), entities: [AuthorSchema, BookSchema],
  schemaGenerator: Deno.args[1] === "compat" ? { defaultUpdateRule: "cascade" } : {} });
console.log(await orm.schema.getUpdateSchemaSQL({ wrap: false }) || "(no diff)");
await orm.close();
