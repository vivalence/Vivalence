import { assertEquals } from "$std/assert";

import { sig } from "../parser/index.js";

Deno.test("Signature signal creation", () => {
  const signals = sig.signal("/users/123/profile");

  assertEquals(signals.length, 3);
  assertEquals(signals[0].segment, "users");
  assertEquals(signals[1].segment, "123");
  assertEquals(signals[2].segment, "profile");
});

Deno.test("Signature pattern matching", () => {
  const patterns = sig.pattern("/users/:id/profile");
  const signals = sig.signal("/users/123/profile");

  const userMatch = patterns[0].match(signals[0]);
  const idMatch = patterns[1].match(signals[1]);
  const profileMatch = patterns[2].match(signals[2]);

  assertEquals(userMatch.segment, "users");
  assertEquals(idMatch?.params.id, "123");
  assertEquals(profileMatch.segment, "profile");
});

Deno.test("Signature Object Instantiation", () => {
  const pattern = {
    pattern: "/users/:id/profile",
    valence: "does this and that",
  };

  const patterns = sig.pattern(pattern);
  const signals = sig.signal("/users/123/profile");
  console.log(patterns);
  console.log(signals);

  const profileMatch = patterns[2].match(signals[2]);

  assertEquals(profileMatch.segment, "profile");
  assertEquals(patterns[2].segment, "profile");
  assertEquals(patterns[2].index, 2);
  assertEquals(patterns[2].pattern, pattern.pattern);
});
