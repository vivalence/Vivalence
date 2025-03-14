import { assertEquals } from "$std/assert";

import { signal, pattern } from "../src/parsers/key.ts";

Deno.test("Key signal creation", () => {
  const signals = signal("Ctrl+S g");

  assertEquals(signals.length, 2);
  assertEquals(signals[0].value.key, "S");
  assertEquals(signals[0].value.modifiers[0], "Ctrl");
  assertEquals(signals[1].value.key, "g");
  assertEquals(signals[1].value.modifiers.length, 0);
});

Deno.test("Key pattern matching", () => {
  const patterns = pattern("Ctrl+S g");

  const ctrlSSignal = { type: "key", value: { key: "S", modifiers: ["Ctrl"] } };
  const gSignal = { type: "key", value: { key: "g", modifiers: [] } };

  const ctrlSMatch = patterns[0].match(ctrlSSignal);
  const gMatch = patterns[1].match(gSignal);

  assertEquals(ctrlSMatch, {});
  assertEquals(gMatch, {});
});
