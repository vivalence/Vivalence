import { assertEquals } from "$std/assert";

import path from "../parsers/path.ts";

Deno.test("Path signal creation", () => {
  const signals = path.signal("/users/123/profile");

  assertEquals(signals.length, 3);
  assertEquals(signals[0].value.segment, "users");
  assertEquals(signals[1].value.segment, "123");
  assertEquals(signals[2].value.segment, "profile");
});

Deno.test("Path pattern matching", () => {
  const patterns = path.pattern("/users/:id/profile");
  const signals = path.signal("/users/123/profile");

  const userMatch = patterns[0].match(signals[0]);
  const idMatch = patterns[1].match(signals[1]);
  const profileMatch = patterns[2].match(signals[2]);

  assertEquals(userMatch.value.segment, "users");
  assertEquals(idMatch?.params.id, "123");
  assertEquals(profileMatch.value.segment, "profile");
});

Deno.test("Path Object Instantiation", () => {
  const pattern = {
    path: "/users/:id/profile",
    valence: "does this and that",
    input: { key: "value" },
  };
  const patterns = path.pattern(pattern);

  const signals = path.signal("/users/123/profile");
  const profileMatch = patterns[2].match(signals[2]);

  assertEquals(profileMatch.value.segment, "profile");
  assertEquals(patterns[2].docs, { ...pattern, segment: "profile" });
});
