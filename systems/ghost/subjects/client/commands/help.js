import { Vector, shape } from "@vivalence/typology";

export const help = new Vector().open(
  { nature: "/help", valence: "the repl's verbs as a tree. Example: /help", chord: "leader/?" },
  (ctx) => {
    ctx.controller.stdout.log(shape.strip(ctx.repl.commands));
  },
);
