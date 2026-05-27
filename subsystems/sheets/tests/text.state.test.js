import { assertEquals } from "@std/assert";
import { backspace, init, insert, move } from "../state/text.js";

Deno.test("text: insert at cursor advances cursor", () => {
  let state = init();
  state = insert(state, "h");
  state = insert(state, "i");
  assertEquals(state.value, "hi");
  assertEquals(state.cursor, 2);
});

Deno.test("text: move then insert mid-string", () => {
  let state = init({ value: "ac" });
  state = move(state, -1);
  state = insert(state, "b");
  assertEquals(state.value, "abc");
  assertEquals(state.cursor, 2);
});

Deno.test("text: backspace removes char before cursor", () => {
  let state = init({ value: "ab" });
  state = backspace(state);
  assertEquals(state.value, "a");
  assertEquals(state.cursor, 1);
});

Deno.test("text: move clamps to bounds", () => {
  let state = init({ value: "a" });
  state = move(state, -5);
  assertEquals(state.cursor, 0);
  state = move(state, 5);
  assertEquals(state.cursor, 1);
});
