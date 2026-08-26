import { assertEquals, assertThrows } from "@std/assert";
import paladin from "@vivalence/paladin";
import { register, specs } from "../trajectories/instance/target.js";

// specs() reads the MOUNTED instance. this file used to inherit one from whatever ran before it,
// so a sibling suite scrubbing VIVA_INSTANCE_MOUNT turned these red. each test mounts its own.
const mounted = (name, fn) =>
  Deno.test(name, async () => {
    const mount = await Deno.makeTempDir({ prefix: "target-test-" });
    paladin.env.set("VIVA_INSTANCE_MOUNT", mount);
    try {
      await fn(mount);
    } finally {
      paladin.env.delete("VIVA_INSTANCE_MOUNT");
    }
  });

mounted("specs: no target → all children", () => {
  const result = specs(undefined);
  assertEquals(result.map((spec) => spec.process).sort(), ["kajuit", "runtime"]);
});

mounted("specs: 'runtime' → runtime only", () => {
  const result = specs("runtime");
  assertEquals(result.length, 1);
  assertEquals(result[0].process, "runtime");
});

mounted("specs: 'kajuit' → kajuit only", () => {
  const result = specs("kajuit");
  assertEquals(result.length, 1);
  assertEquals(result[0].process, "kajuit");
});

mounted("specs: unknown target throws", () => {
  assertThrows(() => specs("nonsense"), Error, "unknown target");
});

mounted("specs: every spec carries the instance mount", (mount) => {
  for (const spec of specs("all")) {
    assertEquals(spec.mount, mount);
    assertEquals(spec.env.VIVA_INSTANCE_MOUNT, spec.mount);
    assertEquals(spec.cmd.slice(0, 2), ["deno", "task"]);
  }
});

Deno.test("specs: with no instance mounted at all, it throws", () => {
  paladin.env.delete("VIVA_INSTANCE_MOUNT");
  assertThrows(() => specs("all"), Error, "no instance mounted");
});

mounted("specs: threads the given instance into every spec, never a derived name", (mount) => {
  for (const spec of specs("all", { instance: "italian" })) {
    assertEquals(spec.instance, "italian");
  }
  for (const spec of specs("all")) {
    assertEquals(spec.instance, null);
  }
});

Deno.test("register: an unrecorded mount throws the tap line and writes nothing", async () => {
  const root = await Deno.makeTempDir({ prefix: "register-test-" });
  const mount = await Deno.makeTempDir({ suffix: "-italian" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  paladin.env.set("VIVA_INSTANCE_MOUNT", mount);
  try {
    let thrown = null;
    try {
      await register();
    } catch (error) {
      thrown = error;
    }
    assertEquals(String(thrown).includes("instances/tap"), true);
    assertEquals(await Deno.readTextFile(`${root}/instances.json`).catch(() => null), null);
  } finally {
    paladin.env.delete("VIVA_LEDGER_MOUNT");
    paladin.env.delete("VIVA_INSTANCE_MOUNT");
  }
});

Deno.test("register: a recorded mount returns the slug and touches updatedAt only", async () => {
  const root = await Deno.makeTempDir({ prefix: "register-test-" });
  const mount = await Deno.makeTempDir({ suffix: "-italian" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  paladin.env.set("VIVA_INSTANCE_MOUNT", mount);
  try {
    await paladin.ledger.instances.write("italian", { mount });
    const before = await paladin.ledger.instances.read("italian");
    const slug = await register();
    assertEquals(slug, "italian");
    const after = await paladin.ledger.instances.read("italian");
    assertEquals(after.mount, mount);
    assertEquals(after.createdAt, before.createdAt);
  } finally {
    paladin.env.delete("VIVA_LEDGER_MOUNT");
    paladin.env.delete("VIVA_INSTANCE_MOUNT");
  }
});
