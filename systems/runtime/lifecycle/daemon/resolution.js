import { Cargo, shape, shard, steer } from "@vivalence/typology";

export const domain = async (die, next) => {
  die.daemon.aperture.use(shard.secure.authenticate());

  if (die.daemon.domain.aperture) {
    die.daemon.domain.aperture.use(shard.context.bind("daemon", die.daemon));
    die.daemon.aperture.slurp(die.daemon.domain.aperture);
    die.daemon.call = shape.proxy(die.daemon.domain.aperture, steer.strategy.direct);
  }

  await die.daemon.domain.resolve?.(die.daemon);
  await next();
};

export const modes = (execution) => async (die, next) => {
  try {
    for (const mode of die.daemon.flatmodes()) {
      await steer.dispatch.execute(execution, { mask: mode.module, mode, daemon: die.daemon, traits: die.instance.traits });
    }
    await die.daemon.datamap.shard.scope(() => Promise.all(die.daemon.flatmodes().flatMap((mode) => mode.finalizers).map((finalize) => finalize())));
    for (const mode of die.daemon.flatmodes()) {
      die.daemon.aperture
        .branch(mode.reference.nature)
        .use(shard.secure.authorize())
        .use(die.daemon.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })))
        .slurp(mode.aperture);
    }
    await next();
  } finally {
    for (const mode of die.daemon.flatmodes()) {
      for (const terminate of mode.terminators ?? []) await terminate();
      mode.stdout.close();
    }
  }
};

export const freight = async (die, next) => {
  const fraught = () =>
    die.daemon
      .flatmodes()
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
