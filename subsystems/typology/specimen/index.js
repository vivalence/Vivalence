export * from "@std/testing/bdd";
export * from "@std/assert";
export * from "@std/expect";
export { snapshot } from "./snapshot.js";

import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { gestalten } from "@vivalence/typology";

expect.extend({
  matches(ctx, schema) {
    const errors = [...schema.errors(ctx.value)];
    const id = typeof schema.$id === "string" ? schema.$id : "";
    return {
      pass: errors.length === 0,
      message: () =>
        errors.length === 0
          ? `expected value NOT to match schema ${id}`
          : `expected value to match schema ${id}:\n` +
            errors.map((e) => `  ${e.instancePath || "<root>"}: ${e.message}`).join("\n"),
    };
  },
});

export const is = {
  Path: (thing) => expect(gestalten.is.prototypes.Path(thing)).toBeTruthy(),
};
