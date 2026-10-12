import { Vector, shape } from "@vivalence/typology";

export const help = new Vector().open(
  { nature: "/help", valence: "the repl's verbs as a tree. Example: /help" },
  (ctx) => shape.strip(ctx.repl),
);
