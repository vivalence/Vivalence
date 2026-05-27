import { assertEquals } from "@std/assert";
import { init, move, toggle, values } from "../state/multiselect.js";

const options = [
  { label: "env", value: "env" },
  { label: "packages", value: "packages" },
  { label: "daemons", value: "daemons" },
];

Deno.test("multiselect: toggle adds then removes", () => {
  let state = init({ options });
  state = toggle(state);
  assertEquals(values(state), ["env"]);
  state = toggle(state);
  assertEquals(values(state), []);
});

Deno.test("multiselect: move then toggle selects the right option", () => {
  let state = init({ options });
  state = move(state, 2);
  state = toggle(state);
  assertEquals(values(state), ["daemons"]);
});

Deno.test("multiselect: defaultValue seeds selection", () => {
  const state = init({ options, selected: ["packages"] });
  assertEquals(values(state), ["packages"]);
});
