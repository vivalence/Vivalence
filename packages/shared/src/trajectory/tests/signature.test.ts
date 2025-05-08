import { assertEquals } from "$std/assert";
import sig from "../parsers/signature.ts";

Deno.test("Signature signal creation from string (path)", () => {
  const signals = sig.signal("/users/123/profile");

  assertEquals(signals.length, 1);
  assertEquals(signals[0].type, "sig");
  assertEquals(signals[0].value.path, "/users/123/profile");
});

Deno.test("Signature signal creation from object", () => {
  const signals = sig.signal({
    path: "/users/123/profile",
    key: "s",
    modifiers: ["Shift"],
  });

  assertEquals(signals.length, 1);
  assertEquals(signals[0].type, "sig");
  assertEquals(signals[0].value.path, "/users/123/profile");
  assertEquals(signals[0].value.key, "s");
  assertEquals(signals[0].value.modifiers.length, 1);
  assertEquals(signals[0].value.modifiers[0], "Shift");
});

Deno.test("Signature pattern creation and matching - path parameter", () => {
  const pattern = sig.pattern("/users/:id/profile")[0];
  const signal = sig.signal("/users/123/profile")[0];

  const match = pattern.match(signal);
  assertEquals(match.params.id, "123");
});

Deno.test(
  "Signature pattern creation and matching - path with two parameters",
  () => {
    const pattern = sig.pattern("/users/:id/profile/:operation")[0];
    const signal = sig.signal("/users/123/profile/lorem")[0];

    const match = pattern.match(signal);
    assertEquals(match.params.id, "123");
    assertEquals(match.params.operation, "lorem");
  },
);

Deno.test(
  "Signature pattern creation and matching - key with modifiers",
  () => {
    const pattern = sig.pattern({
      key: "s",
      modifiers: ["Shift"],
    })[0];

    const signal = sig.signal({
      key: "s",
      modifiers: ["Shift"],
    })[0];

    const result = pattern.match(signal);
    // console.log("result", result);
    assertEquals(result !== null, true);
  },
);

Deno.test(
  "Signature pattern creation and matching - combined path and key",
  () => {
    const pattern = sig.pattern({
      path: "/users/:id/profile",
      key: "s",
      modifiers: ["Shift"],
    })[0];

    const signal = sig.signal({
      path: "/users/123/profile",
      key: "s",
      modifiers: ["Shift"],
    })[0];

    const match = pattern.match(signal);
    assertEquals(match.params.id, "123");
  },
);

Deno.test("Signature pattern with documentation", () => {
  const pattern = sig.pattern({
    path: "/api/v1/:resource",
    name: "API Resource",
    valence: "Access API resource",
    input: { resource: { type: "string" } },
    output: { data: { type: "object" } },
    customProp: "custom value",
  })[0];

  assertEquals(pattern.docs.name, "API Resource");
  assertEquals(pattern.docs.valence, "Access API resource");
  assertEquals(pattern.docs.input.resource.type, "string");
  assertEquals(pattern.docs.output.data.type, "object");
  assertEquals(pattern.docs.customProp, "custom value");
});

Deno.test("Signature pattern with wildcards", () => {
  const pattern = sig.pattern("/api/*/items")[0];
  const signal = sig.signal("/api/v1/items")[0];

  const result = pattern.match(signal);
  assertEquals(result !== null, true);
});

Deno.test("Signature pattern non-matching - wrong path", () => {
  const pattern = sig.pattern("/users/:id/profile")[0];
  const signal = sig.signal("/users/123/settings")[0];

  const match = pattern.match(signal);
  assertEquals(match, null);
});

Deno.test(
  "Signature pattern non-matching - path segment count mismatch",
  () => {
    const pattern = sig.pattern("/api/:version/:resource")[0];
    const signal = sig.signal("/api/v1")[0];
    const result = pattern.match(signal);
    assertEquals(result, null);
  },
);

Deno.test("Signature pattern non-matching - wrong key", () => {
  const pattern = sig.pattern({ path: "/users/:id/profile", key: "s" })[0];
  const signal = sig.signal({ path: "/users/123/profile", key: "a" })[0];
  const match = pattern.match(signal);
  assertEquals(match, null);
});

Deno.test("Signature pattern non-matching - wrong modifiers", () => {
  const pattern = sig.pattern({ key: "s", modifiers: ["Shift"] })[0];
  const signal = sig.signal({ key: "s", modifiers: ["Ctrl"] })[0];
  const match = pattern.match(signal);
  assertEquals(match, null);
});

Deno.test("Signature pattern non-matching - missing modifiers", () => {
  const pattern = sig.pattern({ key: "s", modifiers: ["Shift", "Ctrl"] })[0];
  const signal = sig.signal({ key: "s", modifiers: ["Shift"] })[0];
  const match = pattern.match(signal);
  assertEquals(match, null);
});
