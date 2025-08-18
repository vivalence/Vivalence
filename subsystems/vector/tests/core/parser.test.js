import { assertEquals } from "$std/assert";

import { sig } from "../../parser/index.js";

Deno.test("Signature signal creation", () => {
  const signals = sig.signal("/users/123/profile");

  assertEquals(signals.length, 3);
  assertEquals(signals[0].signature, "users");
  assertEquals(signals[1].signature, "123");
  assertEquals(signals[2].signature, "profile");
});

Deno.test("Signature pattern matching", () => {
  const patterns = sig.pattern("/users/:id/profile");
  const signals = sig.signal("/users/123/profile");

  const userMatch = patterns[0].match(signals[0]);
  const idMatch = patterns[1].match(signals[1]);
  const profileMatch = patterns[2].match(signals[2]);

  // console.log(patterns, signals, profileMatch);

  assertEquals(userMatch.signature, "users");
  assertEquals(idMatch?.params.id, "123");
  assertEquals(profileMatch.signature, "profile");
});

Deno.test("Signature Object Instantiation", () => {
  const pattern = {
    trail: "/users/:id/profile",
    valence: "does this and that",
  };

  const patterns = sig.pattern(pattern);
  const signals = sig.signal("/users/123/profile");

  const profileMatch = patterns[2].match(signals[2]);

  assertEquals(profileMatch.signature, "profile");
  assertEquals(patterns[2].signature, "profile");
  assertEquals(patterns[2].index, 2);
  assertEquals(patterns[2].trail, pattern.trail);
});
