import paladin from "@vivalence/paladin";
import daemon from "@vivalence/daemon";

import { Mode, Url } from "@vivalence/typology";
import { is, array } from "@vivalence/shared";
import { maps } from "@vivalence/entities";
import { Vector } from "@vivalence/vector";

import { traitmap } from "./modes/traitmap.js";

export async function core(die) {
  die.register = await paladin.vip.accioMap({
    gaia: die.cake.gaia,
    datamap: die.cake.datamap,
    kernel: die.cake.kernel,
    modes: die.cake.modes,
    services: die.cake.services,
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

  die.variant.modes = [...die.variant.kernel.domain.modes];

  die.variant.entities = [
    maps.system.mode,
    maps.system.valence,
    ...maps.sets.userspace,
    ...die.variant.kernel.domain.entities,
    ...maps.sets.kernel,
  ];
}

export async function entities(die) {
  const { orm, entities } = await die.register.datamap //
    .provider({ datamap: die.cake.datamap, variant: die.variant.entities });

  die.good.kernel.orm = orm;

  die.good.entities = {
    ...entities,
    em: die.good.kernel.orm.em.fork(),
    on: new Vector(),
  };

  for (const variant of die.variant.entities) {
    if (!variant.entity) continue;
    const repository = await die.good.entities.em.getRepository(variant.entity);
    die.good.entities[variant.type] = repository;
  }

  // die.good.ontology.topography = await die.good.entities.em.getRepository(
  //   maps.ontology.topography.entity,
  // );
  // die.good.ontology.dimension = await die.good.entities.em.getRepository(
  //   maps.ontology.dimension.entity,
  // );
}

export async function modes(die) {
  for (const variant of die.variant.modes) {
    if (!die.good.mode[variant.type]) die.good.mode[variant.type] = {};

    const cake = die.register.modes //
      .find((mode) => mode.manifest.type === variant.type);

    const mode = new variant.prototype(cake);
    mode.mount = die.good.tilde.branch(`/mode/${mode.type}/${mode.slug}`);
    // mode.url = new Url(mode.mount, paladin.daemon.statics.serve);

    // console.log(die.good.entities);
    // mode.entity = await die.good.entities.mode //
    //   .ensure({ type: mode.type, slug: mode.slug });

    // mode.entity.traits = array //
    //   .unique([...mode.entity.traits, ...mode.traits]);

    die.good.mode[mode.type][mode.slug] = mode;
  }

  die.good.modes = () =>
    Object.values(die.good.mode)
      .map((type) => Object.values(type))
      .flat();

  await die.good.entities.em.flush();
}

export async function gaia(die) {
  die.good.gaia = await die.register.gaia //
    .provider(die.cake.gaia, die.good.entities.user);
}

export async function services(die) {
  for (const servicecake of die.cake.services) {
    const register = await paladin.vip.accio(servicecake.module);
    die.good.service[servicecake.slug] = await register.provider(servicecake);
  }
}

// export async function twitches(die) {
//   for (const handler of Object.values(ontology.populate)) await handler(die);
//   for (const handler of Object.values(ontology.resolve)) await handler(die);
// }

//   if (die.register.modules.domain.lifecycle.construct)
//     await die.register.modules.domain.lifecycle.construct(die.good);
