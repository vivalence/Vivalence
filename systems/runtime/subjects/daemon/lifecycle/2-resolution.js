import { contexts, shape, shard, steer } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

export const domain = async (die, next) => {
  die.daemon.aperture.use(die.runtime.lighthouse.authenticate).use(die.runtime.lighthouse.bind);
  die.daemon.aperture.use(async (ctx, next) => { //@beef autoenroll. temporary.
    const row = await die.runtime.entities.daemon.findOneOrFail({ slug: die.daemon.slug }, { populate: ["users"] });
    if (!row.users.contains(ctx.user)) {
      row.users.add(ctx.user);
      await die.runtime.entities.em.flush();
    }
    await next();
  });

  if (die.daemon.domain.aperture) {
    die.daemon.domain.aperture.use(shard.context.spread(contexts.host, die.daemon));
    die.daemon.aperture.graft(die.daemon.domain.aperture);
    die.daemon.call = shape.proxy(die.daemon.domain.aperture, steer.strategy.direct);
  }

  await die.daemon.domain.resolve?.(die.daemon);
  await next();
};

export const modes = (factory) => async (die, next) => {
  try {
    await belt.modes.resolve(die.daemon, factory, die.traits);
    await next();
  } finally {
    await belt.modes.release(die.daemon);
  }
};
