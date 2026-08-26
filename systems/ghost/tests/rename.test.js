import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { rename } from "../trajectories/instances/rename.js";

function fake(params) {
  return { ctx: { signal: { params } } };
}

async function home() {
  const root = await Deno.makeTempDir({ prefix: "rename-test-" });
  await Deno.mkdir(`${root}/locks`, { recursive: true });
  await Deno.mkdir(`${root}/logs`, { recursive: true });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  return root;
}

function scrub() {
  paladin.env.delete("VIVA_LEDGER_MOUNT");
}

Deno.test("rename: moves the record key, dead locks, and the log dir", async () => {
  const root = await home();
  await paladin.ledger.instances.write("old", { mount: "/anchor" });
  await Deno.writeTextFile(`${root}/locks/old_runtime.lock`, JSON.stringify({ pid: 4999999 }));
  await Deno.mkdir(`${root}/logs/old`, { recursive: true });
  await Deno.writeTextFile(`${root}/logs/old/spans.jsonl`, "held\n");
  const { ctx } = fake(["old", "new"]);
  await rename(ctx);
  assertEquals(ctx.effect.renamed, { old: "new" });
  assertEquals(await paladin.ledger.instances.read("old"), null);
  assertEquals((await paladin.ledger.instances.read("new")).mount, "/anchor");
  assertEquals((await Deno.stat(`${root}/locks/new_runtime.lock`)).isFile, true);
  assertEquals(await Deno.readTextFile(`${root}/logs/new/spans.jsonl`), "held\n");
  scrub();
});

Deno.test("rename: refuses while a lock is alive — a running instance keeps its name", async () => {
  const root = await home();
  await paladin.ledger.instances.write("busy", { mount: "/anchor" });
  await Deno.writeTextFile(`${root}/locks/busy_runtime.lock`, JSON.stringify({ pid: Deno.pid }));
  const { ctx } = fake(["busy", "idle"]);
  await rename(ctx);
  assertEquals(String(ctx.effect.error).includes("running"), true);
  assertEquals((await paladin.ledger.instances.read("busy")).mount, "/anchor");
  scrub();
});

Deno.test("rename: no record and collisions are honest errors", async () => {
  const root = await home();
  const { ctx } = fake(["absent", "x"]);
  await rename(ctx);
  assertEquals(String(ctx.effect.error).includes("no record"), true);
  await paladin.ledger.instances.write("a", { mount: "/a" });
  await paladin.ledger.instances.write("b", { mount: "/b" });
  const second = fake(["a", "b"]).ctx;
  await rename(second);
  assertEquals(String(second.effect.error).includes("already held"), true);
  scrub();
});
