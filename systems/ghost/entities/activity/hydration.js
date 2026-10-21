import { Vector, v } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  const remote = ctx.runtime.connection.branch(`/userspace/entities/activity/${ctx.entity.id}`);
  for (const name of v.primitives.controller.SIGNALS) ctx.entity.controller.stdin.open(name, (signalDie) => remote.call(`/stdin/${name}`, { reason: signalDie.input }));
});
