import { assertEquals } from "@std/assert";
import { activeField, atActions, init, reduce } from "../state/form.js";

Deno.test("formMachine: set stores value at active field without advancing focus", () => {
  let state = init({
    fields: [{ name: "username" }, { name: "password" }],
    actions: ["commit", "skip"],
  });
  state = reduce(state, { kind: "set", value: "beef" });
  assertEquals(state.values, { username: "beef" });
  assertEquals(state.active, 0);
  assertEquals(activeField(state).name, "username");
});

Deno.test("formMachine: next/prev move focus, clamped, reaching the actions bar", () => {
  let state = init({ fields: [{ name: "a" }, { name: "b" }], actions: ["ok"] });
  state = reduce(state, { kind: "prev" });
  assertEquals(state.active, 0);
  state = reduce(state, { kind: "next" });
  assertEquals(activeField(state).name, "b");
  state = reduce(state, { kind: "next" });
  assertEquals(atActions(state), true);
  state = reduce(state, { kind: "next" });
  assertEquals(state.active, 2);
});

Deno.test("formMachine: skip is reachable with empty values (no data left behind)", () => {
  let state = init({
    fields: [{ name: "username" }, { name: "password" }],
    actions: ["commit", "skip"],
  });
  state = reduce(state, { kind: "next" });
  state = reduce(state, { kind: "next" });
  assertEquals(atActions(state), true);
  state = reduce(state, { kind: "action", action: "skip" });
  assertEquals(state.done, true);
  assertEquals(state.action, "skip");
  assertEquals(state.values, {});
});

Deno.test("formMachine: commit carries collected values", () => {
  let state = init({ fields: [{ name: "username" }], actions: ["commit", "skip"] });
  state = reduce(state, { kind: "set", value: "beef" });
  state = reduce(state, { kind: "next" });
  state = reduce(state, { kind: "action", action: "commit" });
  assertEquals(state.action, "commit");
  assertEquals(state.values, { username: "beef" });
});
