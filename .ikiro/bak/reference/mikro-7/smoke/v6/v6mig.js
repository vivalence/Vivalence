import { EntitySchema, types, Cascade } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
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
const here = new URL(".", import.meta.url).pathname;
const orm = await MikroORM.init({ dbName: Deno.args[0], entities: [AuthorSchema, BookSchema], extensions: [Migrator], baseDir: here,
  migrations: { path: "./migrations", transactional: false, emit: "js" } });
const migrator = orm.getMigrator();
console.log("v6 checkMigrationNeeded:", await migrator.checkMigrationNeeded());
const created = await migrator.createMigration();
console.log("v6 created:", created.fileName);
await migrator.up();
console.log("v6 after up checkMigrationNeeded:", await migrator.checkMigrationNeeded());
await orm.close();
