import { assertEquals } from "@std/assert";
import paladin from "@vivalence/paladin";
import { drive, recorder } from "./verb.js";

async function home() {
  const root = await Deno.makeTempDir({ prefix: "clone-test-" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  return root;
}

function scrub() {
  paladin.env.delete("VIVA_LEDGER_MOUNT");
  paladin.env.delete("VIVA_INSTANCE_MOUNT");
}

Deno.test("clone: a bare slug matching no instance module errors honestly, never stats", async () => {
  await home();
  const output = await drive(["instance/clone", "zzz-absent"]);
  assertEquals(String(output.error).includes("zzz-absent"), true);
  scrub();
});

Deno.test("clone: an unambiguous slug clones to the shelf and writes the record", async () => {
  const root = await home();
  const output = await drive(["instance/clone", "fixture"]);
  assertEquals(output.slug, "fixture");
  assertEquals(output.target, `${root}/instances/fixture`);
  assertEquals((await Deno.stat(`${root}/instances/fixture/instance.viva.json`)).isFile, true);
  const record = JSON.parse(await Deno.readTextFile(`${root}/instances.json`));
  assertEquals(record.fixture.mount, `${root}/instances/fixture`);
  scrub();
});

Deno.test("clone: a full triple resolves headlessly through the same fold", async () => {
  const root = await home();
  const output = await drive(["instance/clone", "@commons/instance/fixture"]);
  assertEquals(output.target, `${root}/instances/fixture`);
  scrub();
});

Deno.test("clone: --slug names the record and the shelf, recipe stays the source", async () => {
  const root = await home();
  const output = await drive(["instance/clone", "fixture", "--slug=scratch"]);
  assertEquals(output.slug, "scratch");
  assertEquals(output.target, `${root}/instances/scratch`);
  const record = JSON.parse(await Deno.readTextFile(`${root}/instances.json`));
  assertEquals(record.scratch.mount, `${root}/instances/scratch`);
  assertEquals(record.fixture, undefined);
  scrub();
});

Deno.test("clone: an existing slug is a hard error — no heuristic, no suffixing", async () => {
  const root = await home();
  await Deno.writeTextFile(`${root}/instances.json`, JSON.stringify({ fixture: { mount: "/held" } }));
  const output = await drive(["instance/clone", "fixture"]);
  assertEquals(String(output.error).includes("exists"), true);
  assertEquals(await Deno.stat(`${root}/instances/fixture`).catch(() => null), null);
  scrub();
});

Deno.test("clone: --install pins the new mount at the flag stratum, then chains instance/install", async () => {
  const root = await home();
  const { calls, call } = recorder();
  const output = await drive(["instance/clone", "fixture", "--install"], { call });
  assertEquals(paladin.env.get("VIVA_INSTANCE_MOUNT"), `${root}/instances/fixture`);
  assertEquals(paladin.env.provenance("VIVA_INSTANCE_MOUNT"), "flag");
  assertEquals(calls, [["instance/install"]]);
  assertEquals(output.installed, { chained: "instance/install" });
  scrub();
});

Deno.test("clone: --use alone chains instance/use and pins nothing itself", async () => {
  const root = await home();
  const { calls, call } = recorder();
  const output = await drive(["instance/clone", "fixture", "--use"], { call });
  assertEquals(calls, [["instance/use", `${root}/instances/fixture`]]);
  assertEquals(output.selected, { chained: "instance/use" });
  assertEquals(output.installed, undefined);
  assertEquals(paladin.env.provenance("VIVA_INSTANCE_MOUNT"), null);
  scrub();
});

Deno.test("clone: --use --install chain use first, then install", async () => {
  const root = await home();
  const { calls, call } = recorder();
  const output = await drive(["instance/clone", "fixture", "--use", "--install"], { call });
  assertEquals(calls, [["instance/use", `${root}/instances/fixture`], ["instance/install"]]);
  assertEquals(output.selected, { chained: "instance/use" });
  assertEquals(output.installed, { chained: "instance/install" });
  scrub();
});
