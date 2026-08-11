import { is } from "@vivalence/typology";
import { IntentEntity } from "@vivalence/runtime";

const ensure = async (em, mode, user) => {
  em.setFilterParams("user", { user: user.id });
  for (const intentPojo of mode.module.dataset.intent) {
    await em.getRepository(IntentEntity).ensure({ ...intentPojo, mode: mode.id, user: user.id });
  }
  await em.flush();
};

export const INTENTED = async (mode, daemon) => {
  if (!is.array(mode.module.dataset?.intent)) return;

  daemon.twitch.open("/after/user/create", async (ctx) => {
    const em = ctx.input.em.fork();
    for (const peer of daemon.flatmodes()) {
      if (!peer.implements("INTENTED")) continue;
      if (!is.array(peer.module.dataset?.intent)) continue;
      await ensure(em, peer, ctx.input.entity);
    }
  });

  return async () => {
    for (const user of await daemon.entities.user.findAll()) {
      await ensure(daemon.entities.em, mode, user);
    }
  };
};
