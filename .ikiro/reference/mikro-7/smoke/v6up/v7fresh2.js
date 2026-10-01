import { EntitySchema, types, Cascade } from "@mikro-orm/core";
import { MikroORM, SqliteDriver, NodeSqliteDialect } from "@mikro-orm/sql";
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
const db = here + "fresh.db";
const orm = await MikroORM.init({ driver: SqliteDriver, dbName: db, driverOptions: new NodeSqliteDialect(db), entities: [AuthorSchema, BookSchema],
  extensions: [Migrator], baseDir: here, migrations: { path: "./migrations", transactional: false, emit: "js" } });
const migrator = orm.migrator;
console.log("v7 getExecuted:", (await migrator.getExecuted()).map((m) => m.name));
try { console.log("v7 getPending:", (await migrator.getPending()).map((m) => m.name)); } catch (e) { console.log("getPending error:", e.message); }
console.log("v7 checkSchema (v6 snapshot):", await migrator.checkSchema());
try { await migrator.up(); console.log("up ok"); } catch (e) { console.log("up error:", e.message.slice(0, 300)); }
await orm.close();
