import { computed } from "nanostores";
import { Vector, belt, v } from "@vivalence/typology";

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.trait = belt.traits.cast(ctx.entity, v.thread.traits);
  ctx.entity.$buffers = computed(ctx.runtime.entities.buffer.$entities, (buffers) => buffers.filter((buffer) => buffer.thread === ctx.entity).sort((first, second) => first.index - second.index));
  ctx.entity.$phase = computed(ctx.runtime.entities.thread.$entities, () => ctx.entity.phase);
  ctx.entity.$turns = computed(ctx.runtime.entities.turn.$entities, (turns) => turns.filter((turn) => turn.thread === ctx.entity).sort((first, second) => new Date(first.createdAt) - new Date(second.createdAt)));
  ctx.entity.$activities = computed(ctx.runtime.entities.activity.$entities, (activities) => activities.filter((activity) => activity.thread === ctx.entity));
});
