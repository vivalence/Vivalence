import * as belt from "../belt/index.js";

export const narrowing = (command, offered) => async (ctx, next) => {
  const words = ctx.signal.body.map((datum) => String(datum));
  const options = offered(ctx);
  const found = belt.catalog.narrowed(options, words);
  if (found.length === 1) return next();
  if (ctx.client.app === null) {
    ctx.output = { which: found };
    return;
  }
  ctx.terminal.repl.narrow({ nature: command.nature, valence: command.valence, options }, words);
};
