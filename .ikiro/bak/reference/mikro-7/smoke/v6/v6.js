import { EntitySchema, types, Cascade } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/sqlite";
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
const orm = await MikroORM.init({ dbName: Deno.args[0], entities: [AuthorSchema, BookSchema] });
await orm.schema.createSchema();
console.log(await orm.schema.getCreateSchemaSQL({ wrap: false }));
await orm.close();
