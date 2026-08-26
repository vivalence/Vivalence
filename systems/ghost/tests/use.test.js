import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { use } from "../trajectories/instances/use.js";

function fake(params, flags = {}) {
  const calls = [];
  const ctx = {
    signal: { params, flags },
    call: async (segments) => {
      calls.push(segments);
      return { chained: true };
    },
  };
  return { ctx, calls };
}

async function home() {
  const root = await Deno.makeTempDir({ prefix: "use-test-" });
  await Deno.mkdir(`${root}/sessions`, { recursive: true });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  return root;
}

function scrub() {
  paladin.env.delete("VIVA_LEDGER_MOUNT");
  paladin.env.delete("VIVA_INSTANCE_MOUNT");
  Deno.env.delete("VIVA_PROCESS_ID");
}

Deno.test("use: bare prints the current selection with provenance", async () => {
  await home();
  const mount = await Deno.makeTempDir({ prefix: "instance-a-" });
  paladin.env.set("VIVA_INSTANCE_MOUNT", mount);
  const { ctx } = fake([]);
  await use(ctx);
  assertEquals(ctx.effect.instance, mount);
  assertEquals(ctx.effect.stratum, "flag");
  scrub();
});

Deno.test("use: a recorded path selects, registers, and carries no note", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ suffix: "-italian" });
  await paladin.ledger.instances.write("italian", { mount });
  Deno.env.set("VIVA_PROCESS_ID", "777");
  const { ctx } = fake([mount]);
  await use(ctx);
  const session = JSON.parse(await Deno.readTextFile(`${root}/sessions/777.json`));
  assertEquals(session.VIVA_INSTANCE_MOUNT, mount);
  assertEquals(paladin.env.provenance("VIVA_INSTANCE_MOUNT"), "session");
  assertEquals(ctx.effect.note, undefined);
  assertEquals((await paladin.ledger.instances.read("italian")).mount, mount);
  scrub();
});

Deno.test("use: an untapped path still selects — the effect carries the tap note", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ suffix: "-stray" });
  Deno.env.set("VIVA_PROCESS_ID", "781");
  const { ctx } = fake([mount]);
  await use(ctx);
  assertEquals(ctx.effect.selected, mount);
  assertEquals(String(ctx.effect.note).includes("instances/tap"), true);
  const session = JSON.parse(await Deno.readTextFile(`${root}/sessions/781.json`));
  assertEquals(session.VIVA_INSTANCE_MOUNT, mount);
  scrub();
});

Deno.test("use: a bare slug matching no record errors honestly, never a shelf guess", async () => {
  const root = await home();
  await Deno.writeTextFile(`${root}/instances.json`, JSON.stringify({ italian: { mount: "/a" } }));
  Deno.env.set("VIVA_PROCESS_ID", "782");
  const { ctx } = fake(["zzz-absent"]);
  await use(ctx);
  assertEquals(String(ctx.effect.error).includes("zzz-absent"), true);
  assertEquals(await Deno.readTextFile(`${root}/sessions/782.json`).catch(() => null), null);
  scrub();
});

Deno.test("use: bare --ledger writes the machine default", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ suffix: "-spanish" });
  const { ctx } = fake([mount], { ledger: true });
  await use(ctx);
  const held = await Deno.readTextFile(`${root}/.env`);
  assertEquals(held, `VIVA_INSTANCE_MOUNT="${mount}"\n`);
  assertEquals(ctx.effect.stratum, "ledger");
  scrub();
});

Deno.test("use: no VIVA_PROCESS_ID and no --ledger throws", async () => {
  await home();
  const { ctx } = fake(["/anywhere"]);
  let thrown = null;
  try {
    await use(ctx);
  } catch (error) {
    thrown = error;
  }
  assertEquals(String(thrown).includes("VIVA_PROCESS_ID"), true);
  scrub();
});

Deno.test("use: trailing params chain under /instance, effect is the chained return", async () => {
  await home();
  const mount = await Deno.makeTempDir({ suffix: "-french" });
  Deno.env.set("VIVA_PROCESS_ID", "778");
  const { ctx, calls } = fake([mount, "run", "runtime"]);
  await use(ctx);
  assertEquals(calls, [["instance/run", "runtime"]]);
  assertEquals(ctx.effect, { chained: true });
  scrub();
});

Deno.test("use: an unambiguous slug resolves against the ledger record, no picker", async () => {
  const root = await home();
  await Deno.mkdir(`${root}/instances/standalone`, { recursive: true });
  await Deno.writeTextFile(
    `${root}/instances.json`,
    JSON.stringify({ standalone: { mount: `${root}/instances/standalone` } }),
  );
  Deno.env.set("VIVA_PROCESS_ID", "779");
  const { ctx } = fake(["standal"]);
  await use(ctx);
  // MOUNT MEANS PATH — the operator typed a slug, the record holds the resolved path
  assertEquals(ctx.effect.selected, `${root}/instances/standalone`);
  const session = JSON.parse(await Deno.readTextFile(`${root}/sessions/779.json`));
  assertEquals(session.VIVA_INSTANCE_MOUNT, `${root}/instances/standalone`);
  scrub();
});

Deno.test("use: an ambiguous slug in a pipe names the candidates instead of prompting", async () => {
  const root = await home();
  await Deno.writeTextFile(
    `${root}/instances.json`,
    JSON.stringify({ italian: { mount: "/a" }, italiano: { mount: "/b" } }),
  );
  Deno.env.set("VIVA_PROCESS_ID", "780");
  const { ctx } = fake(["italian"]);
  let thrown = null;
  try {
    await use(ctx);
  } catch (error) {
    thrown = error;
  }
  assertEquals(String(thrown).includes("italiano"), true);
  scrub();
});

Deno.test("use --ledger upserts one line, leaving the rest of the .env intact", async () => {
  const root = await home();
  await Deno.writeTextFile(
    `${root}/.env`,
    '# machine\nVIVA_INSTANCE_MOUNT="/old"\n\n# keys\nSECRET_VIVA_JWT="keep"\n',
  );
  const mount = await Deno.makeTempDir({ suffix: "-italian" });
  const { ctx } = fake([mount], { ledger: true });
  await use(ctx);
  assertEquals(
    await Deno.readTextFile(`${root}/.env`),
    `# machine\nVIVA_INSTANCE_MOUNT="${mount}"\n\n# keys\nSECRET_VIVA_JWT="keep"\n`,
  );
  scrub();
});
