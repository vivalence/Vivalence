import { EntitySchema, types } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/sqlite";
class Thing {}
const ThingSchema = new EntitySchema({ class: Thing, properties: { id: { type: types.integer, primary: true }, name: { type: types.string } } });
const orm = await MikroORM.init({ dbName: ":memory:", entities: [ThingSchema] });
await orm.schema.create();
const em = orm.em.fork();
em.create(Thing, { name: "x" });
await em.flush();
console.log("better-sqlite3 under deno:", JSON.stringify(await em.getConnection().execute("select * from thing")), "sqlite", JSON.stringify(await em.getConnection().execute("select sqlite_version() v")));
try { await em.getConnection().execute("create table a (x int); create table b (y int);"); } catch (e) { console.log("multi-statement execute():", e.message); }
await orm.close();
