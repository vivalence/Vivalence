import { assertEquals } from "@std/assert";
import { init, move, value } from "../state/select.js";

const options = [
  { label: "a", value: "A" },
  { label: "b", value: "B" },
  { label: "c", value: "C" },
];

Deno.test("select: move clamps within bounds", () => {
  let state = init({ options });
  state = move(state, -1);
  assertEquals(state.index, 0);
  state = move(state, 1);
  state = move(state, 1);
  state = move(state, 1);
  assertEquals(state.index, 2);
});

Deno.test("select: value reads option.value", () => {
  let state = init({ options });
  state = move(state, 1);
  assertEquals(value(state), "B");
});

Deno.test("select: bare string options", () => {
  let state = init({ options: ["x", "y"] });
  state = move(state, 1);
  assertEquals(value(state), "y");
});
