import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { drive } from "./verb.js";

async function home() {
  const root = await Deno.makeTempDir({ prefix: "rename-test-" });
  for (const organ of ["instances", "locks", "logs", "sessions"]) {
    await Deno.mkdir(`${root}/${organ}`, { recursive: true });
  }
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  return root;
}

function scrub() {
  paladin.env.delete("VIVA_LEDGER_MOUNT");
  paladin.env.delete("VIVA_INSTANCE_MOUNT");
}

const present = async (path) => Boolean(await Deno.stat(path).catch(() => null));

async function shelve(root, slug) {
  const mount = `${root}/instances/${slug}`;
  await Deno.mkdir(`${mount}/mountpoint`, { recursive: true });
  await Deno.writeTextFile(`${mount}/instance.viva.js`, "export const manifest = {};\n");
  await paladin.ledger.instances.write(slug, { mount });
  return mount;
}

Deno.test("rename: shelf dir follows the slug — record mount, dead lock, logs, and the sessions that selected it move", async () => {
  const root = await home();
  const mount = await shelve(root, "old");
  await paladin.ledger.instances.write("stay", { mount: "/anchor" });
  await Deno.writeTextFile(`${root}/locks/old.lock`, JSON.stringify({ pid: 4999999, processes: [] }));
  await Deno.mkdir(`${root}/logs/old`, { recursive: true });
  await Deno.writeTextFile(`${root}/logs/old/spans.jsonl`, "held\n");
  await Deno.writeTextFile(`${root}/sessions/111.json`, JSON.stringify({ VIVA_INSTANCE_MOUNT: mount }));
  await Deno.writeTextFile(`${root}/sessions/222.json`, JSON.stringify({ VIVA_INSTANCE_MOUNT: "/anchor" }));

  const output = await drive(["instance/rename", "old", "new"]);

  const target = `${root}/instances/new`;
  assertEquals(output.renamed, { old: "new" });
  assertEquals(output.dir, target);
  assertEquals(output.logs, true);
  assertEquals(await paladin.ledger.instances.read("old"), null);
  assertEquals((await paladin.ledger.instances.read("new")).mount, target);
  assertEquals(await present(mount), false);
  assertEquals(await present(`${target}/instance.viva.js`), true);
  assertEquals(await present(`${root}/locks/old.lock`), false);
  assertEquals(await Deno.readTextFile(`${root}/logs/new/spans.jsonl`), "held\n");
  assertEquals(JSON.parse(await Deno.readTextFile(`${root}/sessions/111.json`)).VIVA_INSTANCE_MOUNT, target);
  assertEquals(JSON.parse(await Deno.readTextFile(`${root}/sessions/222.json`)).VIVA_INSTANCE_MOUNT, "/anchor");
  assertEquals((await paladin.ledger.instances.read("stay")).mount, "/anchor");
  scrub();
});

Deno.test("rename: one param renames the mounted instance; a tapped dir stays where it is", async () => {
  const root = await home();
  const mount = `${root}/elsewhere`;
  await Deno.mkdir(mount, { recursive: true });
  await paladin.ledger.instances.write("tapped", { mount });
  paladin.env.set("VIVA_INSTANCE_MOUNT", mount, "flag");

  const output = await drive(["instance/rename", "moved"]);

  assertEquals(output.renamed, { tapped: "moved" });
  assertEquals(output.dir, "kept — off-shelf (tapped)");
  assertEquals(await present(mount), true);
  assertEquals((await paladin.ledger.instances.read("moved")).mount, mount);
  assertEquals(await paladin.ledger.instances.read("tapped"), null);
  scrub();
});

Deno.test("rename: refuses while a lock is alive — a running instance keeps its name", async () => {
  const root = await home();
  const mount = await shelve(root, "busy");
  await Deno.writeTextFile(`${root}/locks/busy.lock`, JSON.stringify({ pid: Deno.pid, processes: [] }));
  const output = await drive(["instance/rename", "busy", "idle"]);
  assertEquals(String(output.error).includes("running"), true);
  assertEquals((await paladin.ledger.instances.read("busy")).mount, mount);
  assertEquals(await present(mount), true);
  scrub();
});

Deno.test("rename: no record and collisions are honest errors", async () => {
  const root = await home();
  const output = await drive(["instance/rename", "absent", "x"]);
  assertEquals(String(output.error).includes("no instance"), true);
  await shelve(root, "left");
  await shelve(root, "right");
  const second = await drive(["instance/rename", "left", "right"]);
  assertEquals(String(second.error).includes("already held"), true);
  assertEquals(await present(`${root}/instances/left`), true);
  scrub();
});
