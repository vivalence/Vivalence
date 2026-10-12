import { Vector, NotFound } from "@vivalence/typology";

export const missing = new Vector().open({ nature: "*", valence: "a verb the shell does not know. Example: viva bogus" }, (ctx) => {
  console.error(`viva ${ctx.signal.pathname}: no such verb — viva --help`);
  throw new NotFound(ctx.signal);
});
