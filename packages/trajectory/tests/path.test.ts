import { assertEquals } from "$std/assert";

import path from "../parsers/path.ts";

Deno.test("Path signal creation", () => {
  const signals = path.signal("/users/123/profile");

  assertEquals(signals.length, 3);
  assertEquals(signals[0].value, "users");
  assertEquals(signals[1].value, "123");
  assertEquals(signals[2].value, "profile");
});

Deno.test("Path pattern matching", () => {
  const patterns = path.pattern("/users/:id/profile");
  // pattern  must contain docs.

  const userSignal = { type: "path", value: "users" };
  const idSignal = { type: "path", value: "123" };
  const profileSignal = { type: "path", value: "profile" };

  const userMatch = patterns[0].match(userSignal);
  const idMatch = patterns[1].match(idSignal);
  const profileMatch = patterns[2].match(profileSignal);

  assertEquals(userMatch, {});
  assertEquals(idMatch?.id, "123");
  assertEquals(profileMatch, {});
});
