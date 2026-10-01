import { EntitySchema, types } from "@mikro-orm/core";
import { MikroORM, SqliteDriver, NodeSqliteDialect } from "@mikro-orm/sql";
class Thing {}
const ThingSchema = new EntitySchema({ class: Thing, properties: { id: { type: types.integer, primary: true } } });
const orm = await MikroORM.init({ driver: SqliteDriver, dbName: ":memory:", driverOptions: new NodeSqliteDialect(":memory:"), entities: [ThingSchema] });
await orm.em.getConnection().execute("create table a (x int); create table b (y int);");
console.log("node:sqlite execute() of 2 statements ->", JSON.stringify(await orm.em.getConnection().execute("select name from sqlite_master where type = 'table'")));
await orm.em.getConnection().executeDump("create table c (x int); create table d (y int);");
console.log("node:sqlite executeDump() of 2 statements ->", JSON.stringify(await orm.em.getConnection().execute("select name from sqlite_master where type = 'table'")));
await orm.close();
