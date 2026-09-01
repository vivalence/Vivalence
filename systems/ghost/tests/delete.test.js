import { assertEquals, assertRejects } from "@std/assert";
import paladin from "@vivalence/paladin";
import { remove } from "../trajectories/instance/delete.js";

function fake(params, flags = {}) {
  return { ctx: { signal: { params, flags }, interactive: false } };
}

async function home() {
  const root = await Deno.makeTempDir({ prefix: "delete-test-" });
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

Deno.test("delete --force: shelf dir, record, dead lock, logs, and the sessions that selected it go; the rest stays", async () => {
  const root = await home();
  const mount = await shelve(root, "gone");
  await paladin.ledger.instances.write("stay", { mount: "/anchor" });
  await Deno.writeTextFile(`${root}/locks/gone.lock`, JSON.stringify({ pid: 4999999, processes: [{ process: "runtime", pid: 4999998 }] }));
  await Deno.mkdir(`${root}/logs/gone`, { recursive: true });
  await Deno.writeTextFile(`${root}/logs/gone/spans.jsonl`, "held\n");
  await Deno.writeTextFile(`${root}/sessions/111.json`, JSON.stringify({ VIVA_INSTANCE_MOUNT: mount }));
  await Deno.writeTextFile(`${root}/sessions/222.json`, JSON.stringify({ VIVA_INSTANCE_MOUNT: "/anchor" }));

  const { ctx } = fake(["gone"], { force: true });
  await remove(ctx);

  assertEquals(ctx.effect.deleted, "gone");
  assertEquals(ctx.effect.files, "removed");
  assertEquals(ctx.effect.logs, true);
  assertEquals(ctx.effect.sessions, [111]);
  assertEquals(await present(mount), false);
  assertEquals(await present(`${root}/locks/gone.lock`), false);
  assertEquals(await present(`${root}/logs/gone`), false);
  assertEquals(await present(`${root}/sessions/111.json`), false);
  assertEquals(await present(`${root}/sessions/222.json`), true);
  assertEquals(await paladin.ledger.instances.read("gone"), null);
  assertEquals((await paladin.ledger.instances.read("stay")).mount, "/anchor");
  scrub();
});

Deno.test("delete: refuses while a lock is alive — nothing touched", async () => {
  const root = await home();
  const mount = await shelve(root, "busy");
  await Deno.writeTextFile(`${root}/locks/busy.lock`, JSON.stringify({ pid: Deno.pid, processes: [{ process: "runtime", pid: Deno.pid }] }));

  const { ctx } = fake(["busy"], { force: true });
  await remove(ctx);

  assertEquals(String(ctx.effect.error).includes("running"), true);
  assertEquals(await present(mount), true);
  assertEquals((await paladin.ledger.instances.read("busy")).mount, mount);
  scrub();
});

Deno.test("delete: an off-shelf (tapped) dir is unrecorded, its files stay", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ prefix: "tapped-" });
  await Deno.writeTextFile(`${mount}/instance.viva.js`, "export const manifest = {};\n");
  await paladin.ledger.instances.write("tapped", { mount });

  const { ctx } = fake([mount], { force: true });
  await remove(ctx);

  assertEquals(ctx.effect.deleted, "tapped");
  assertEquals(ctx.effect.files.startsWith("kept"), true);
  assertEquals(await present(`${mount}/instance.viva.js`), true);
  assertEquals(await paladin.ledger.instances.read("tapped"), null);
  scrub();
});

Deno.test("delete: without --force in a pipe it throws and touches nothing", async () => {
  const root = await home();
  const mount = await shelve(root, "asked");

  const { ctx } = fake(["asked"]);
  await assertRejects(() => remove(ctx), Error, "--force");

  assertEquals(await present(mount), true);
  assertEquals((await paladin.ledger.instances.read("asked")).mount, mount);
  scrub();
});

Deno.test("delete: an unrecorded mount is an honest error", async () => {
  const root = await home();
  const stray = `${root}/instances/stray`;
  await Deno.mkdir(stray, { recursive: true });

  const { ctx } = fake([stray], { force: true });
  await remove(ctx);

  assertEquals(String(ctx.effect.error).includes("not recorded"), true);
  assertEquals(await present(stray), true);
  scrub();
});

Deno.test("delete: a slug prefix resolves through the instances lens, like use", async () => {
  const root = await home();
  const mount = await shelve(root, "hello-world");
  const { ctx } = fake(["hello"], { force: true });
  await remove(ctx);
  assertEquals(ctx.effect.deleted, "hello-world");
  assertEquals(await present(mount), false);
  scrub();
});
