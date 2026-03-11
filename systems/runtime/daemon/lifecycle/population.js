import paladin from "@vivalence/paladin";

import { is, Mode, Url, Path, shards } from "@vivalence/typology";
import { maps } from "@vivalence/typology/entities";
import { Vector, compiler, controller } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
import { array } from "@vivalence/shared";
// import { Vector, compiler, controller, shards } from "@vivalence/vector";

import * as kernelmodes from "../mode/kernel.js";
import * as traitmap from "../mode/traitmap.js";

export async function core(die) {
  die.register = await paladin.vip.accioMap({
    lighthouse: die.mask.lighthouse,
    hallucinator: die.mask.hallucinator,
    datamap: die.mask.datamap,
    kernel: die.mask.kernel,
    modes: die.mask.modes,
    consume: die.mask.consume,
  });

  die.kernel = {
    domain: die.register.kernel.find((m) => m.manifest.type === "domain"),
    topology: die.register.kernel.filter((m) => m.manifest.type === "topology"),
    ontology: die.register.kernel.filter((m) => m.manifest.type === "ontology"),
  };

  die.variant.traits = {
    ...kernelmodes.traits,
    ...traitmap,
    ...(die.kernel.domain.traits || {}),
  };

  die.variant.modes = [...kernelmodes.modes, ...(die.kernel.domain.modes || [])];

  die.variant.entities = [
    ...maps.sets.daemon,
    ...maps.sets.kernel,
    ...maps.sets.userspace,
    ...die.kernel.domain.entities,
  ];
}

export function wiring(daemonDie) {
  daemonDie.good.statics = daemonDie.mask.statics;
  daemonDie.good.docs = daemonDie.mask.docs;
}

export async function datamap(daemonDie) {
  const { orm, entities } = await daemonDie.register.datamap //
    .provider(daemonDie.mask.datamap, daemonDie.variant.entities);

  daemonDie.good.kernel.orm = orm;

  daemonDie.good.entities = {
    ...entities,
    em: daemonDie.good.kernel.orm.em.fork(),
    on: new Vector(),
  };

  for (const variant of daemonDie.variant.entities) {
    if (!variant.entity) continue;

    const repository = await daemonDie.good.entities.em //
      .getRepository(variant.entity);

    daemonDie.good.entities[variant.type] = repository;
  }

  // die.good.ontology.topography = await die.good.entities.em .getRepository(maps.ontology.topography.entity);
  // die.good.ontology.dimension = await die.good.entities.em .getRepository(maps.ontology.dimension.entity);
}

export async function acid(daemonDie) {
  daemonDie.good.hallucinator = await daemonDie.register.hallucinator //
    .provider(daemonDie.mask.hallucinator);
  // console.log("@daemon/population daemonDie.good.hallucinator", daemonDie.good.hallucinator,);
}

export async function authority(daemonDie) {
  daemonDie.good.lighthouse = await daemonDie.register.lighthouse //
    .provider(daemonDie.mask.lighthouse, daemonDie.good.entities.user);

  daemonDie.good.aperture //
    .use(shards.secure.authority(daemonDie.good.lighthouse))
    .use(async (ctx, next) => {
      ctx.daemon.connection = daemonDie.connection.clone(); //
      ctx.daemon.connection //
        .use(async (context, next) => {
          context.request.headers.set("authorization", ctx.request.headers.get("authorization"));
          await next();
        });
      ctx.daemon.call = ctx.daemon.connection.call.bind(ctx.daemon.connection);
      await next();
    });
}

export async function services(daemonDie) {
  for (const [slug, servicemask] of Object.entries(daemonDie.mask.consume)) {
    const servicecake = daemonDie.register.consume[slug];
    daemonDie.good.services[slug] = await servicecake.provider(servicemask);
  }
}

export async function modes(daemonDie) {
  const registeredModes = [...daemonDie.register.kernel, ...daemonDie.register.modes]
    .map((register) => {
      const variant = daemonDie.variant.modes //
        .find((v) => register.manifest.type === v.type);

      if (variant) return { variant, register };

      console.log(`@runtime/daemon/population/modes(${register.type})`);
      console.log("variant not found during mode construction");
      console.log({ register });
    })
    .filter(Boolean);

  for (const { register, variant } of registeredModes) {
    const mode = new variant.prototype(register);
    mode.mount = daemonDie.good.mount.branch(`/mode/${mode.type}/${mode.slug}`);
    mode.url = daemonDie.good.url.branch(mode.mount.nature);

    if (!mode.aperture) mode.aperture = new Aperture();

    if (mode.implements("TERMINAL")) {
      mode.cake.view.path.from(new Path(mode.cake.mount.dirname));

      const url = daemonDie.good.attach
        .branch("/view")
        .branch(mode.mount.absolute)
        .branch(mode.cake.view.path.nature);

      mode.cake.view.withUrl(url);
    }

    mode.entity = await daemonDie.good.entities.mode //
      .ensure({ type: mode.type, slug: mode.slug });

    mode.entity.traits = array //
      .unique([...mode.entity.traits, ...mode.traits]);

    mode.id = mode.entity.id; // ugly

    if (!daemonDie.good.modes[mode.type]) daemonDie.good.modes[mode.type] = {};
    daemonDie.good.modes[mode.type][mode.slug] = mode;
  }

  await daemonDie.good.entities.em.flush();
}

export function handlers(daemonDie) {
  // daemonDie.good.flatmodules = () => [Object.values(daemonDie.good.kernel), Object.values(daemonDie.good.modes)] .flat() .map((type) => Object.values(type)) .flat();
  daemonDie.good.flatmodes = () =>
    Object.values(daemonDie.good.modes)
      .map((type) => Object.values(type))
      .flat();
}

export async function twitch(die) {
  try {
    const subscriptions = die.good.entities.on.patterns
      .map((p) => p.signature)
      .map((s) => die.kernel.domain.entities.map[s].entity);

    const subscriber = new compiler.Subscriber(subscriptions, async (signal, event) => {
      try {
        const [effect, apply] = controller //
          .traverse(die.good.entities.on, signal);
        const context = { event, daemon: die.good };
        context.daemon.entities.em = context.daemon.entities.em.fork();
        await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
        await context.daemon.entities.em.flush();
      } catch (error) {
        if (!["NOT_FOUND", "LONG", "SHORT"].includes(error.code)) throw error;
      }
    });

    die.good.entities.em
      .getEventManager() //
      .registerSubscriber(subscriber);

    //
  } catch (e) {
    console.log("@runtime/runtime/integrate/twitch");
    console.log("[expected to fail on pattern signature entity lookup]");
    console.log("[haha future me.]");
    throw e;
  }
}

// export async function twitches(die) {
//   for (const handler of Object.values(ontology.populate)) await handler(die);
//   for (const handler of Object.values(ontology.resolve)) await handler(die);
// }

//   if (die.register.modules.domain.lifecycle.construct)
//     await die.register.modules.domain.lifecycle.construct(die.good);
