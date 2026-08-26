import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { create } from "../trajectories/instance/create.js";

function fake(params, flags = {}) {
  return { ctx: { signal: { params, flags } } };
}

async function home() {
  const root = await Deno.makeTempDir({ prefix: "create-test-" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  return root;
}

function scrub() {
  paladin.env.delete("VIVA_LEDGER_MOUNT");
}

Deno.test("create: a bare slug matching no instance module errors honestly, never stats", async () => {
  await home();
  const { ctx } = fake(["zzz-absent"]);
  await create(ctx);
  assertEquals(String(ctx.effect.error).includes("zzz-absent"), true);
  scrub();
});

Deno.test("create: an unambiguous slug clones to the shelf and writes the record", async () => {
  const root = await home();
  const { ctx } = fake(["fixture"]);
  await create(ctx);
  assertEquals(ctx.effect.slug, "fixture");
  assertEquals(ctx.effect.target, `${root}/instances/fixture`);
  assertEquals((await Deno.stat(`${root}/instances/fixture/fixture.viva.js`)).isFile, true);
  const record = JSON.parse(await Deno.readTextFile(`${root}/instances.json`));
  assertEquals(record.fixture.mount, `${root}/instances/fixture`);
  scrub();
});

Deno.test("create: a full triple resolves headlessly through the same fold", async () => {
  const root = await home();
  const { ctx } = fake(["@fixtures/instance/fixture"]);
  await create(ctx);
  assertEquals(ctx.effect.target, `${root}/instances/fixture`);
  scrub();
});

Deno.test("create: --slug names the record and the shelf, recipe stays the source", async () => {
  const root = await home();
  const { ctx } = fake(["fixture"], { slug: "scratch" });
  await create(ctx);
  assertEquals(ctx.effect.slug, "scratch");
  assertEquals(ctx.effect.target, `${root}/instances/scratch`);
  const record = JSON.parse(await Deno.readTextFile(`${root}/instances.json`));
  assertEquals(record.scratch.mount, `${root}/instances/scratch`);
  assertEquals(record.fixture, undefined);
  scrub();
});

Deno.test("create: an existing slug is a hard error — no heuristic, no suffixing", async () => {
  const root = await home();
  await Deno.writeTextFile(`${root}/instances.json`, JSON.stringify({ fixture: { mount: "/held" } }));
  const { ctx } = fake(["fixture"]);
  await create(ctx);
  assertEquals(String(ctx.effect.error).includes("exists"), true);
  assertEquals(await Deno.stat(`${root}/instances/fixture`).catch(() => null), null);
  scrub();
});
