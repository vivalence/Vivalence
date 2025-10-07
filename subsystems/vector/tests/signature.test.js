import { assertEquals } from "$std/assert";
import { Pattern, Signal } from "@vivalence/typology";

Deno.test("Pattern: string to literal", () => {
  const pattern = new Pattern("/users/have/:many");

  assertEquals(pattern.signature, "users");
  assertEquals(pattern.type, "literal");
  assertEquals(typeof pattern.filter, "function");
  assertEquals(pattern.gauges.length, 1);
});

Deno.test("Pattern: branching creates tree", () => {
  const root = new Pattern("/users");
  const child = root.branch(":id");
  const grandchild = child.branch("profile");

  assertEquals(root.gauges.length, 1);
  assertEquals(child.ancestor, root);
  assertEquals(grandchild.ancestor, child);
  assertEquals(root.heir, child);
  assertEquals(child.heir, grandchild);
});

Deno.test("Pattern: depth and index", () => {
  const root = new Pattern("/users");
  const child = root.branch(":id");
  const grandchild = child.branch("profile");

  assertEquals(root.index, 0);
  assertEquals(child.index, 1);
  assertEquals(grandchild.index, 2);
  assertEquals(root.depth, 2);
  assertEquals(child.depth, 1);
  assertEquals(grandchild.depth, 0);
});

Deno.test("Pattern: apply with literal", () => {
  const pattern = new Pattern("users");
  const signal = new Signal("users");
  const result = pattern.apply(signal);
  assertEquals(result?.signature, "users");
});

Deno.test("Pattern: apply with parameter", () => {
  const pattern = new Pattern("/:id");
  const signal = new Signal("123");
  const result = pattern.apply(signal);
  assertEquals(result?.parameters?.id, "123");
});

Deno.test("Signal: branching with gauge", () => {
  const root = new Signal("users");
  const child = root.branch("123");

  assertEquals(child.ancestor, root);
  assertEquals(child.index, 1);
  assertEquals(root.gauges.length, 1);
});

Deno.test("Pattern: tilde finds root", () => {
  const root = new Pattern("/users");
  const child = root.branch(":id");
  const grandchild = child.branch("profile");

  assertEquals(grandchild.tilde, root);
  assertEquals(child.tilde, root);
  assertEquals(root.tilde, root);
});
