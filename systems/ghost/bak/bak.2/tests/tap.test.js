import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { tap } from "../trajectories/instances/tap.js";

function fake(params, flags = {}) {
  return { ctx: { signal: { params, flags } } };
}

async function home() {
  const root = await Deno.makeTempDir({ prefix: "tap-test-" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  return root;
}

function scrub() {
  paladin.env.delete("VIVA_LEDGER_MOUNT");
}

Deno.test("tap: path and --slug are both required", async () => {
  await home();
  const { ctx } = fake(["/somewhere"]);
  await tap(ctx);
  assertEquals(String(ctx.effect.error).includes("usage"), true);
  scrub();
});

Deno.test("tap: a bare token is refused — a tap takes a PATH", async () => {
  await home();
  const { ctx } = fake(["somedir"], { slug: "x" });
  await tap(ctx);
  assertEquals(String(ctx.effect.error).includes("./somedir"), true);
  scrub();
});

Deno.test("tap: a real dir lands in the record under the given slug", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ suffix: "-adopted" });
  const { ctx } = fake([mount], { slug: "adopted" });
  await tap(ctx);
  assertEquals(ctx.effect.tapped, "adopted");
  const record = JSON.parse(await Deno.readTextFile(`${root}/instances.json`));
  assertEquals(record.adopted.mount, mount);
  scrub();
});

Deno.test("tap: an existing slug is a hard error", async () => {
  const root = await home();
  await Deno.writeTextFile(`${root}/instances.json`, JSON.stringify({ adopted: { mount: "/held" } }));
  const mount = await Deno.makeTempDir({ suffix: "-second" });
  const { ctx } = fake([mount], { slug: "adopted" });
  await tap(ctx);
  assertEquals(String(ctx.effect.error).includes("exists"), true);
  scrub();
});

Deno.test("tap: nothing at the path is an honest error", async () => {
  await home();
  const { ctx } = fake(["/no/such/dir"], { slug: "ghost" });
  await tap(ctx);
  assertEquals(String(ctx.effect.error).includes("no directory"), true);
  scrub();
});
