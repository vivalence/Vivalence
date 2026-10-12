import { Vector, shape, shard } from "@vivalence/typology";
import { factory as clientFactory } from "../client/factory.js";
import * as surface from "../surface/index.js";

export const shell = new Vector()
  .use(shard.controller.open)
  .use(async (ctx, next) => {
    await next();
    if (ctx.output) console.log("ctx.output:", JSON.stringify(ctx.output, null, 2));
  })
  .use(async (ctx, next) => {
    if (ctx.signal.flags.help !== true) return next();
    ctx.output = shape.strip(shell);
  })
  .open({ nature: "/help", valence: "the shell's verbs. Example: viva help" }, () =>
    shape.strip(shell),
  )
  .open(
    { nature: "/repl", valence: "the repl as plain lines in this terminal. Example: viva repl" },
    clientFactory(surface.repl),
  )
  .open(
    {
      nature: "/chrome",
      valence: "the repl under the chrome — the dock paints. Example: viva chrome",
    },
    clientFactory(surface.chrome),
  )
  .do(clientFactory(surface.repl));
