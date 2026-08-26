// paging lives in the fold, not the caller — else every multi-page form reimplements it.
import { init, reduce, activeField, atActions, page } from "../state/form.js";
import { assertEquals } from "@std/assert";

const mk = () =>
  init({
    pages: [
      { title: "addresses", fields: [{ name: "a1" }, { name: "a2" }] },
      { title: "keys", fields: [{ name: "k1" }] },
    ],
    actions: ["commit", "skip"],
  });
const walk = (state, kinds) => kinds.reduce((held, kind) => reduce(held, { kind }), state);

Deno.test("form pages: a one-page form behaves exactly as before", () => {
  let state = init({ pages: [{ fields: [{ name: "x" }, { name: "y" }] }], actions: ["ok"] });
  assertEquals(activeField(state).name, "x");
  state = reduce(state, { kind: "next" });
  assertEquals(activeField(state).name, "y");
  state = reduce(state, { kind: "next" });
  assertEquals(atActions(state), true);
  state = reduce(state, { kind: "next" });
  assertEquals(state.page, 0, "a single page never advances past itself");
});

Deno.test("form pages: next past the actions crosses into the next page", () => {
  const state = walk(mk(), ["next", "next", "next"]);
  assertEquals(state.page, 1);
  assertEquals(state.active, 0);
  assertEquals(activeField(state).name, "k1");
});

Deno.test("form pages: the last page does not advance", () => {
  const state = walk(mk(), ["next", "next", "next", "next", "next", "next"]);
  assertEquals(state.page, 1);
  assertEquals(atActions(state), true);
});

Deno.test("form pages: prev at the first field steps back to the previous page's actions", () => {
  const forward = walk(mk(), ["next", "next", "next"]);
  const back = reduce(forward, { kind: "prev" });
  assertEquals(back.page, 0);
  assertEquals(atActions(back), true, "lands on the actions row, where you left it");
});

Deno.test("form pages: prev on the very first field is a floor", () => {
  const state = reduce(mk(), { kind: "prev" });
  assertEquals(state.page, 0);
  assertEquals(state.active, 0);
});

Deno.test("form pages: values accumulate ACROSS pages into one bag", () => {
  let state = mk();
  state = reduce(state, { kind: "set", value: "A1" });
  state = walk(state, ["next"]);
  state = reduce(state, { kind: "set", value: "A2" });
  state = walk(state, ["next", "next"]);
  state = reduce(state, { kind: "set", value: "K1" });
  assertEquals(state.values, { a1: "A1", a2: "A2", k1: "K1" });
});

Deno.test("form pages: set on the actions row is a no-op, not a crash", () => {
  const state = reduce(walk(mk(), ["next", "next"]), { kind: "set", value: "nope" });
  assertEquals(state.values, {});
});

Deno.test("form pages: an action ends the whole form from any page", () => {
  const state = reduce(walk(mk(), ["next", "next", "next"]), { kind: "action", action: "commit" });
  assertEquals(state.done, true);
  assertEquals(state.action, "commit");
});

Deno.test("form pages: page() names the current page for a caller to render", () => {
  assertEquals(page(mk()).title, "addresses");
  assertEquals(page(walk(mk(), ["next", "next", "next"])).title, "keys");
});

Deno.test("form pages: an empty page is crossed, not a dead end", () => {
  const state = init({
    pages: [{ fields: [] }, { fields: [{ name: "x" }] }],
    actions: ["ok"],
  });
  assertEquals(atActions(state), true);
  const next = reduce(state, { kind: "next" });
  assertEquals(next.page, 1);
  assertEquals(activeField(next).name, "x");
});
