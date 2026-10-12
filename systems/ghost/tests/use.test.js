import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { drive, recorder } from "./verb.js";

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
  const output = await drive(["instance/use"]);
  assertEquals(output.instance, mount);
  assertEquals(output.stratum, "flag");
  scrub();
});

Deno.test("use: a recorded path selects, registers, and carries no note", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ suffix: "-italian" });
  await paladin.ledger.instances.write("italian", { mount });
  Deno.env.set("VIVA_PROCESS_ID", "777");
  const output = await drive(["instance/use", mount]);
  const session = JSON.parse(await Deno.readTextFile(`${root}/sessions/777.json`));
  assertEquals(session.VIVA_INSTANCE_MOUNT, mount);
  assertEquals(paladin.env.provenance("VIVA_INSTANCE_MOUNT"), "session");
  assertEquals(output.note, undefined);
  assertEquals((await paladin.ledger.instances.read("italian")).mount, mount);
  scrub();
});

Deno.test("use: an untapped path still selects — the output carries the clone note", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ suffix: "-stray" });
  Deno.env.set("VIVA_PROCESS_ID", "781");
  const output = await drive(["instance/use", mount]);
  assertEquals(output.selected, mount);
  assertEquals(String(output.note).includes("instance/clone"), true);
  const session = JSON.parse(await Deno.readTextFile(`${root}/sessions/781.json`));
  assertEquals(session.VIVA_INSTANCE_MOUNT, mount);
  scrub();
});

Deno.test("use: a bare slug matching no record errors honestly, never a shelf guess", async () => {
  const root = await home();
  await Deno.writeTextFile(`${root}/instances.json`, JSON.stringify({ italian: { mount: "/a" } }));
  Deno.env.set("VIVA_PROCESS_ID", "782");
  const output = await drive(["instance/use", "zzz-absent"]);
  assertEquals(String(output.error).includes("zzz-absent"), true);
  assertEquals(await Deno.readTextFile(`${root}/sessions/782.json`).catch(() => null), null);
  scrub();
});

Deno.test("use: bare --ledger writes the machine default", async () => {
  const root = await home();
  const mount = await Deno.makeTempDir({ suffix: "-spanish" });
  const output = await drive(["instance/use", mount, "--ledger"]);
  const held = await Deno.readTextFile(`${root}/.env`);
  assertEquals(held, `VIVA_INSTANCE_MOUNT="${mount}"\n`);
  assertEquals(output.stratum, "ledger");
  scrub();
});

Deno.test("use: no VIVA_PROCESS_ID and no --ledger throws", async () => {
  await home();
  let thrown = null;
  try {
    await drive(["instance/use", "/anywhere"]);
  } catch (error) {
    thrown = error;
  }
  assertEquals(String(thrown).includes("VIVA_PROCESS_ID"), true);
  scrub();
});

Deno.test("use: trailing params chain under /instance, output is the chained return", async () => {
  await home();
  const mount = await Deno.makeTempDir({ suffix: "-french" });
  Deno.env.set("VIVA_PROCESS_ID", "778");
  const { calls, call } = recorder();
  const output = await drive(["instance/use", mount, "up", "runtime"], { call });
  assertEquals(calls, [["instance/up", "runtime"]]);
  assertEquals(output, { chained: "instance/up" });
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
  const output = await drive(["instance/use", "standal"]);
  // MOUNT MEANS PATH — the operator typed a slug, the record holds the resolved path
  assertEquals(output.selected, `${root}/instances/standalone`);
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
  let thrown = null;
  try {
    await drive(["instance/use", "italian"]);
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
  const output = await drive(["instance/use", mount, "--ledger"]);
  assertEquals(
    await Deno.readTextFile(`${root}/.env`),
    `# machine\nVIVA_INSTANCE_MOUNT="${mount}"\n\n# keys\nSECRET_VIVA_JWT="keep"\n`,
  );
  scrub();
});
