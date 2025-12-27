import paladin from "@vivalence/paladin";

import { is, Mode, Url, Path, shards } from "@vivalence/typology";
import { maps } from "@vivalence/typology/entities";
import { Vector, compiler, controller } from "@vivalence/vector";
import { array } from "@vivalence/shared";
// import { Vector, compiler, controller, shards } from "@vivalence/vector";

import { traitmap } from "../mode/traitmap.js";

export async function core(die) {
  die.register = await paladin.vip.accioMap({
    authority: die.mask.authority,
    datamap: die.mask.datamap,
    kernel: die.mask.kernel,
    modes: die.mask.modes,
    services: die.mask.services,
  });

  die.variant.kernel = {
    ontology: die.register.kernel.find((m) => m.manifest.type === "ontology"),
    topology: die.register.kernel.filter((m) => m.manifest.type === "topology"),
    domain: die.register.kernel.find((m) => m.manifest.type === "domain"),
  };

  die.variant.traits = {
    ...(die.variant.kernel.domain.traits || {}),
    ...traitmap,
  };

  die.variant.modes = [
    // todo: some standard set.
    ...die.variant.kernel.domain.modes,
  ];

  die.variant.entities = [
    ...maps.sets.runtime,
    ...maps.sets.kernel,
    ...maps.sets.userspace,
    ...die.variant.kernel.domain.entities,
  ];
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

  // die.good.ontology.topography = await die.good.entities.em.getRepository(
  //   maps.ontology.topography.entity,
  // );
  // die.good.ontology.dimension = await die.good.entities.em.getRepository(
  //   maps.ontology.dimension.entity,
  // );
}

export async function modes(daemonDie) {
  // console.log({ die });
  for (const variant of daemonDie.variant.modes) {
    // todo: cast cake.
    // ensure cake is valid mode cake.
    const cake = daemonDie.register.modes //
      .find((mode) => mode.manifest.type === variant.type);

    if (!cake) {
      console.log(`@runtime/daemon/population/modes(${variant.type})`);
      console.log("cake not found during mode construction");
      continue;
    }
    // console.log({ cake });
    const mode = new variant.prototype(cake);
    mode.mount = daemonDie.good.mount.branch(`/mode/${mode.type}/${mode.slug}`);
    mode.url = daemonDie.good.url.branch(mode.mount.nature);

    if (mode.implements("viewable")) {
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

    //

    if (!daemonDie.good.modes[variant.type])
      daemonDie.good.modes[variant.type] = {};
    daemonDie.good.modes[mode.type][mode.slug] = mode;
  }

  daemonDie.good.flatmodes = () =>
    Object.values(daemonDie.good.modes)
      .map((type) => Object.values(type))
      .flat();

  await daemonDie.good.entities.em.flush();
}

export async function authority(daemonDie) {
  daemonDie.good.authority = await daemonDie.register.authority //
    .provider(daemonDie.mask.authority, daemonDie.good.entities.user);
  daemonDie.good.aperture.use(
    shards.secure.authority(daemonDie.good.authority),
  );
}

// export async function twitches(die) {
//   for (const handler of Object.values(ontology.populate)) await handler(die);
//   for (const handler of Object.values(ontology.resolve)) await handler(die);
// }

//   if (die.register.modules.domain.lifecycle.construct)
//     await die.register.modules.domain.lifecycle.construct(die.good);

export async function twitch(die) {
  try {
    const subscriptions = die.good.entities.on.patterns
      .map((p) => p.signature)
      .map((s) => die.variant.kernel.domain.entities.map[s].entity);

    const subscriber = new compiler.Subscriber(
      subscriptions,
      async (signal, event) => {
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
      },
    );

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
