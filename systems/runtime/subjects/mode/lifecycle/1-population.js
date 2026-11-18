import { wrap } from "@mikro-orm/core";
import paladin from "@vivalence/paladin";
import { Aperture, contexts, control, Cortex, cortex as faculties, shard, Twitch, Vector } from "@vivalence/typology";

export const stdout = async (modeDie, next) => {
  try {
    await next();
    modeDie.mode.stdout.start();
  } catch (error) {
    modeDie.mode.stdout.fault(error);
    throw error;
  }
};

export const acid = async (modeDie, next) => {
  modeDie.register = await paladin.ledger.registry.wire(modeDie.mode.mask);
  const supplied = await Promise.all(
    modeDie.register.hallucinators.map((citizen) => citizen.provider(citizen)),
  );
  modeDie.mode.cortex = new Cortex(supplied.flat());
  modeDie.cortex = modeDie.mode.cortex;
  await next();
};

export const providers = async (modeDie, next) => {
  modeDie.providers = { ...modeDie.providers };
  for (const [slug, citizen] of Object.entries(modeDie.register.consume)) {
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
    .open("/metadata/manifest", (ctx) => ctx.mode.manifest)
    .open("/metadata/cortex", (ctx) => faculties.strip(ctx.mode.cortex));
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

  modeDie.mode.twitch = new Twitch()
    .use(shard.context.spread(contexts.modeDie, modeDie))
    .use(shard.context.bind("mode", modeDie.mode))
    .use(shard.datamap.owned());
  modeDie.mode.twitch
    .branch("/after")
    .use(shard.datamap.detached(modeDie.datamap))
    .use(control.stderr((die) => die.mode.stdout));
  modeDie.datamap.registerSubscriber(modeDie.mode.twitch);

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
