export * from "@std/testing/bdd";
export * from "@std/assert";
export * from "@std/expect";

import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { gestalten } from "@vivalence/typology";

export const is = {
  Path: (thing) => expect(gestalten.is.prototypes.Path(thing)).toBeTruthy(),
  // ...
};
