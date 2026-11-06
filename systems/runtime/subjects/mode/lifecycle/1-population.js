import { wrap } from "@mikro-orm/core";
import { Aperture, contexts, shard, Vector } from "@vivalence/typology";

export const stdout = async (modeDie, next) => {
  try {
    await next();
    modeDie.mode.stdout.start();
  } catch (error) {
    modeDie.mode.stdout.fault(error);
    throw error;
  }
};

export const providers = async (modeDie, next) => {
  modeDie.providers = { ...modeDie.providers };
  for (const [slug, citizen] of Object.entries(modeDie.mode.consume)) {
    modeDie.providers[slug] = await citizen.provider(citizen);
    if (citizen.manifest.traits.includes("TOOLING") && citizen.tools) {
      modeDie.providers[slug].tools = citizen.tools;
    }
  }
  await next();
};

export const core = async (modeDie, next) => {
  modeDie.mode.aperture = new Aperture()
    .use(shard.context.spread(contexts.modeDie, modeDie))
    .use(shard.context.bind("mode", modeDie.mode))
    .open("/metadata/status", (ctx) => ctx.mode.status.reflection)
    .open("/metadata/manifest", (ctx) => ctx.mode.manifest);
  if (modeDie.mode.module.aperture) modeDie.mode.aperture.graft(modeDie.mode.module.aperture);
  for (const kind of ["literal", "symbol", "view", "intent", "file", "note", "thread", "turn", "buffer"]) {
    modeDie.mode.aperture
      .branch(`/entities/${kind}`)
      .use(shard.datamap.bind(modeDie.entities.em, "mode", (ctx) => ({ mode: ctx.mode.id })))
      .graft(shard.datamap.repository(modeDie.entities[kind]));
  }

  modeDie.mode.tools = new Vector()
    .use(shard.context.spread(contexts.modeDie, modeDie))
    .use(shard.context.bind("mode", modeDie.mode));

  await modeDie.datamap.shard.scope(async () => {
    const entity = await modeDie.entities.mode.ensure({
      ...modeDie.mode.manifest,
      daemon: modeDie.mode.daemon,
    });
    entity.traits = [...modeDie.mode.manifest.traits];
    await modeDie.entities.em.flush();
    modeDie.mode.entity = wrap(entity).toPOJO();
    modeDie.mode.id = modeDie.mode.entity.id;
  });
  await next();
};
