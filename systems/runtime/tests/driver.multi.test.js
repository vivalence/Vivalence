import { assertEquals, assertRejects } from "@std/assert";
import { seed } from "./scenarios/datamap.js";

Deno.test("driver.multi — one execute runs one statement, two throw before either runs", async (t) => {
  const { orm } = await seed();
  const connection = orm.em.getConnection();
  const probes = () => connection.execute(`select name from sqlite_master where name like 'probe_%'`);

  await t.step("a single statement answers", async () => {
    assertEquals(await connection.execute("select 1 as one"), [{ one: 1 }]);
  });

  await t.step("a two-statement string throws", async () => {
    await assertRejects(() => connection.execute("create table probe_one (id integer); create table probe_two (id integer)"), Error, "more than one statement");
  });

  await t.step("neither statement ran", async () => {
    assertEquals(await probes(), []);
  });

  await orm.close();
});
