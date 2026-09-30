import { wrap } from "@mikro-orm/core";
import { Aperture, Vector, shard } from "@vivalence/typology";

export const stdout = async (die, next) => {
  try {
    await next();
    die.mode.stdout.open();
  } catch (error) {
    die.mode.stdout.fault(error);
    throw error;
  }
};

export const core = async (die, next) => {
  die.mode.aperture = new Aperture()
    .use(shard.context.bind("daemon", die.daemon))
    .use(shard.context.bind("mode", die.mode))
    .open("/status", (_, ctx) => ctx.mode.status.reflection)
    .open("/manifest", (_, ctx) => ctx.mode.manifest);
  if (die.mode.module.aperture) die.mode.aperture.slurp(die.mode.module.aperture);

  die.mode.tools = new Vector().use(shard.context.bind("daemon", die.daemon)).use(shard.context.bind("mode", die.mode));

  await die.daemon.datamap.shard.scope(async () => {
    const entity = await die.daemon.entities.mode.ensure({ ...die.mode.manifest });
    entity.traits = [...die.mode.manifest.traits];
    await die.daemon.entities.em.flush();
    die.mode.entity = wrap(entity).toPOJO();
    die.mode.id = die.mode.entity.id;
  });
  await next();
};
