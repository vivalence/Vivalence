import { assertEquals, assertThrows } from "@std/assert";
import paladin from "@vivalence/paladin";
import { locate, register, specs } from "../trajectories/instance/target.js";

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
  assertEquals(result.map((spec) => spec.identity.process).sort(), ["kajuit", "runtime"]);
});

mounted("specs: 'runtime' → runtime only", () => {
  const result = specs("runtime");
  assertEquals(result.length, 1);
  assertEquals(result[0].identity.process, "runtime");
});

mounted("specs: 'kajuit' → kajuit only", () => {
  const result = specs("kajuit");
  assertEquals(result.length, 1);
  assertEquals(result[0].identity.process, "kajuit");
});

mounted("specs: unknown target throws", () => {
  assertThrows(() => specs("nonsense"), Error, "unknown target");
});

mounted("specs: every command carries the mount, the ledger, the repository — and never the operator's session pid", (mount) => {
  Deno.env.set("VIVA_PROCESS_ID", "4242");
  try {
    for (const spec of specs("all")) {
      assertEquals(spec.identity.mount, mount);
      assertEquals(spec.command.cwd, mount);
      assertEquals(spec.command.env.VIVA_INSTANCE_MOUNT, mount);
      assertEquals(spec.command.env.VIVA_LEDGER_MOUNT, paladin.scope.ledger.absolute);
      assertEquals(spec.command.env.VIVA_REPOSITORY_MOUNT, paladin.scope.repository.absolute);
      assertEquals(spec.command.env.VIVA_PROCESS_ID, undefined);
      assertEquals(typeof spec.command.env.PATH, "string");
      assertEquals(spec.command.bin, Deno.execPath());
      assertEquals(spec.command.args[0], "task");
    }
  } finally {
    Deno.env.delete("VIVA_PROCESS_ID");
  }
});

Deno.test("specs: with no instance mounted at all, it throws", () => {
  paladin.env.delete("VIVA_INSTANCE_MOUNT");
  assertThrows(() => specs("all"), Error, "nothing selected");
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

Deno.test("locate: a slug prefix matching one record resolves to its mount, headless", async () => {
  const root = await Deno.makeTempDir({ prefix: "locate-test-" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  try {
    await paladin.ledger.instances.write("hello-world", { mount: "/h" });
    await paladin.ledger.instances.write("italian", { mount: "/i" });
    assertEquals(await locate({ interactive: false }, "hello"), { mount: "/h" });
  } finally {
    paladin.env.delete("VIVA_LEDGER_MOUNT");
  }
});

Deno.test("locate: a token matching no record is an error naming the token, on an empty ledger too", async () => {
  const root = await Deno.makeTempDir({ prefix: "locate-test-" });
  paladin.env.set("VIVA_LEDGER_MOUNT", root);
  try {
    const empty = await locate({ interactive: false }, "hello");
    assertEquals(String(empty.error).includes("hello"), true);
    await paladin.ledger.instances.write("italian", { mount: "/i" });
    const none = await locate({ interactive: false }, "hello");
    assertEquals(String(none.error).includes("hello"), true);
    assertEquals(none.mount, undefined);
  } finally {
    paladin.env.delete("VIVA_LEDGER_MOUNT");
  }
});
