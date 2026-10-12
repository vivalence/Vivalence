import { assertEquals } from "@std/assert";
import { init, reduce } from "../state/form.js";

Deno.test("form protocol: unknown event kind is identity", () => {
  const state = init({ pages: [{ fields: [{ name: "x" }] }], actions: ["go"] });
  assertEquals(reduce(state, { kind: "bogus" }), state);
});

Deno.test("form protocol: set at the actions bar (no active field) is a no-op", () => {
  let state = init({ pages: [{ fields: [{ name: "x" }] }], actions: ["go"] });
  state = reduce(state, { kind: "next" });
  assertEquals(reduce(state, { kind: "set", value: "z" }), state);
});
