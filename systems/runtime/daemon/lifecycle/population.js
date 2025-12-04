import paladin from "@vivalence/paladin";

import { is, Mode, Url } from "@vivalence/typology";
import { maps } from "@vivalence/typology/entities";
import { Vector } from "@vivalence/vector";

import { traitmap } from "../modes/traitmap.js";

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

  die.variant.modes = [...die.variant.kernel.domain.modes];

  die.variant.entities = [
    maps.system.mode,
    maps.system.valence,
    ...maps.sets.userspace,
    ...die.variant.kernel.domain.entities,
    ...maps.sets.kernel,
  ];
}

export async function datamap(die) {
  const { orm, entities } = await die.register.datamap //
    .provider(die.mask.datamap, die.variant.entities);

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
    const mask = die.register.modes //
      .find((mode) => mode.manifest.type === variant.type);

    const mode = new variant.prototype(mask);
    mode.mount = die.good.mount.branch(`/mode/${mode.type}/${mode.slug}`);
    // mode.url = new Url(mode.mount, paladin.runtime.statics.serve);

    // console.log(die.good.entities);
    // mode.entity = await die.good.entities.mode //
    //   .ensure({ type: mode.type, slug: mode.slug });

    // mode.entity.traits = array //
    //   .unique([...mode.entity.traits, ...mode.traits]);

    if (!die.good.modes[variant.type]) die.good.modes[variant.type] = {};
    die.good.modes[mode.type][mode.slug] = mode;
  }

  die.good.flatmodes = () =>
    Object.values(die.good.modes)
      .map((type) => Object.values(type))
      .flat();

  await die.good.entities.em.flush();
}

export async function authority(die) {
  die.good.authority = await die.register.authority //
    .provider(die.mask.authority, die.good.entities.user);
}

// legacy/duplicate?
export async function services(die) {
  console.log({ ...die.mask });
  for (const [slug, servicemask] of Object.entries(die.mask.consume)) {
    const register = await paladin.vip.accio(servicemask.module);
    die.good.service[servicemask.slug] = await register.provider(servicemask);
  }
}

// export async function twitches(die) {
//   for (const handler of Object.values(ontology.populate)) await handler(die);
//   for (const handler of Object.values(ontology.resolve)) await handler(die);
// }

//   if (die.register.modules.domain.lifecycle.construct)
//     await die.register.modules.domain.lifecycle.construct(die.good);
