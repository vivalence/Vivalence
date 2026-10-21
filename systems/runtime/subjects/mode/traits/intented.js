import { fromm, is } from "@vivalence/typology";
import { IntentEntity } from "@vivalence/runtime";

const ensure = async (em, mode, user) => {
  em.setFilterParams("user", { user: user.id });
  for (const intentPojo of mode.module.dataset.intent) {
    await em.getRepository(IntentEntity).ensure({
      ...intentPojo,
      mode: mode.id,
      user: user.id,
    });
  }
  await em.flush();
};

export const INTENTED = async (mode, context) => {
  if (!is.array(mode.module.dataset?.intent)) return;

  context.twitch.open("/after/user/create", async (ctx) => {
    for (const peer of fromm.modes(context.modes).flat) {
      if (!peer.implements("INTENTED")) continue;
      if (!is.array(peer.module.dataset?.intent)) continue;
      await ensure(ctx.input.em, peer, ctx.input.entity);
    }
  });

  return async () => {
    for (const user of await context.entities.user.findAll({ filters: { user: false } })) {
      await ensure(context.entities.em, mode, user);
    }
  };
};
