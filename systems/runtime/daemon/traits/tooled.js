import { Vector, shard, shape } from "@vivalence/typology";

export const TOOLED = (mode, daemon) => {
  if (!mode.cake.tools) return;

  const tools = new Vector();
  tools.use(shard.context.bind("daemon", daemon));
  tools.use(shard.context.bind("mode", mode));
  tools.slurp(mode.cake.tools);

  const compiled = shape.agentic(tools);

  mode.cake.harness ??= new Vector();
  mode.cake.harness.branch("/dialogue").use(async (ctx, next) => {
    ctx.hallucination.absorb(compiled);
    await next();
  });
};
