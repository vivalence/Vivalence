import { Cargo, contexts, fromm, shape, shard, steer } from "@vivalence/typology";
import { host } from "../../gestalten/belt/index.js";

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

export const modes = (execution) => async (die, next) => {
  try {
    await host.resolve(die.host, execution, die.traits);
    await next();
  } finally {
    await host.release(die.host);
  }
};

export const freight = async (die, next) => {
  const fraught = () =>
    fromm.modes(die.daemon.modes).flat
      .filter((mode) => mode.implements("FRAUGHT") || mode.implements("MOUNTED"))
      .map((mode) => mode.freight);

  die.daemon.cargo = new Cargo(fraught);

  const seen = new Set();
  for (const freight of fraught()) {
    for (const key of Object.keys(freight.catalog)) {
      if (seen.has(key)) console.warn(`[FREIGHT] slug collision: "${key}"`);
      seen.add(key);
    }
  }
  await next();
};
