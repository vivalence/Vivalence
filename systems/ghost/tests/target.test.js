import { assertEquals, assertThrows } from "@std/assert";
import { specs } from "../trajectories/instance/target.js";

Deno.test("specs: no target → all children", () => {
  const result = specs(undefined);
  assertEquals(result.map((spec) => spec.process).sort(), ["kajuit", "runtime"]);
});

Deno.test("specs: 'runtime' → runtime only", () => {
  const result = specs("runtime");
  assertEquals(result.length, 1);
  assertEquals(result[0].process, "runtime");
});

Deno.test("specs: 'kajuit' → kajuit only", () => {
  const result = specs("kajuit");
  assertEquals(result.length, 1);
  assertEquals(result[0].process, "kajuit");
});

Deno.test("specs: unknown target throws", () => {
  assertThrows(() => specs("nonsense"), Error, "unknown target");
});

Deno.test("specs: every spec carries the instance mount", () => {
  for (const spec of specs("all")) {
    assertEquals(spec.env.VIVA_INSTANCE_MOUNT, spec.mount);
    assertEquals(spec.cmd.slice(0, 2), ["deno", "task"]);
  }
});
