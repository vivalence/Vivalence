import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { create } from "../trajectories/instance/create.js";

function fake(params, flags = {}) {
  const calls = [];
  const call = async (args) => (calls.push(args), { chained: args[0] });
  return { ctx: { signal: { params, flags }, call }, calls };
}

async function home() {
  const root = await Deno.makeTempDir({ prefix: "create-test-" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  return root;
}

function scrub() {
  paladin.env.delete("VIVA_LEDGER_MOUNT");
  paladin.env.delete("VIVA_INSTANCE_MOUNT");
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
  const { ctx } = fake(["@commons/instance/fixture"]);
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

Deno.test("create: --init pins the new mount at the flag stratum, then chains instance/init", async () => {
  const root = await home();
  const { ctx, calls } = fake(["fixture"], { init: true });
  await create(ctx);
  assertEquals(paladin.env.get("VIVA_INSTANCE_MOUNT"), `${root}/instances/fixture`);
  assertEquals(paladin.env.provenance("VIVA_INSTANCE_MOUNT"), "flag");
  assertEquals(calls, [["instance/init"]]);
  assertEquals(ctx.effect.initialized, { chained: "instance/init" });
  scrub();
});

Deno.test("create: --use alone chains instances/use and pins nothing itself", async () => {
  const root = await home();
  const { ctx, calls } = fake(["fixture"], { use: true });
  await create(ctx);
  assertEquals(calls, [["instances/use", `${root}/instances/fixture`]]);
  assertEquals(ctx.effect.selected, { chained: "instances/use" });
  assertEquals(ctx.effect.initialized, undefined);
  assertEquals(paladin.env.provenance("VIVA_INSTANCE_MOUNT"), null);
  scrub();
});

Deno.test("create: --use --init chain use first, then init", async () => {
  const root = await home();
  const { ctx, calls } = fake(["fixture"], { use: true, init: true });
  await create(ctx);
  assertEquals(calls, [["instances/use", `${root}/instances/fixture`], ["instance/init"]]);
  assertEquals(ctx.effect.selected, { chained: "instances/use" });
  assertEquals(ctx.effect.initialized, { chained: "instance/init" });
  scrub();
});
