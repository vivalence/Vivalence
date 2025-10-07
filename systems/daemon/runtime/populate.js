import { Vector } from "@vivalence/vector";
import { is, array } from "@vivalence/shared";
import { Module, Url } from "@vivalence/typology";
import { maps } from "@vivalence/entities";

import * as ontology from "./ontology/index.js";

export async function entities(rme, daemon) {
  rme.maps.orm = await rme.register.database.client(
    rme.config.database,
    rme.maps.entities,
  );

  rme.instance.entities = {
    orm: rme.maps.orm,
    em: rme.maps.orm.em.fork(),
    on: new Vector(),
  };

  for (const [slug, { entity }] of Object.entries(rme.maps.entities)) {
    if (!entity) continue;
    rme.instance.entities[slug] =
      await rme.instance.entities.em.getRepository(entity);
  }

  rme.instance.ontology.topography =
    await rme.instance.entities.em.getRepository(
      maps.ontology.topography.entity,
    );
  rme.instance.ontology.dimension =
    await rme.instance.entities.em.getRepository(
      maps.ontology.dimension.entity,
    );
}

export async function modules(rme, daemon) {
  for (const [type, { prototype }] of Object.entries(rme.maps.modules)) {
    if (!rme.register.modules[type]) continue;
    rme.instance.module[type] = {};

    const modules = is.array(rme.register.modules[type])
      ? rme.register.modules[type]
      : [rme.register.modules[type]];

    for (const register of modules) {
      rme.instance.module[type][register.manifest.slug] = //
        new prototype(register);
    }
  }

  rme.instance.module.values = () =>
    Object.values(rme.instance.module)
      .map((type) => Object.values(type))
      .flat();

  for (const module of rme.instance.module.values()) {
    if (["ontology", "domain"].includes(module.type)) {
      module.path = rme.path.branch(`/module/${module.type}`);
    } else {
      module.path = rme.path.branch(`/module/${module.type}/${module.slug}`);
    }
    module.url = new Url(module.path, daemon.config.url);
  }

  for (const module of rme.instance.module.values()) {
    module.entity = await rme.instance.entities.module //
      .ensure({ type: module.type, slug: module.slug });

    module.entity.traits = array //
      .unique([...module.entity.traits, ...module.traits]);
  }

  await rme.instance.entities.em.flush();
}

export async function lighthouse(rme, daemon) {
  rme.instance.lighthouse = await rme.register.lighthouse //
    .client(rme.config.lighthouse, rme.instance.entities.user);
}

export async function services(rme, daemon) {
  const runtimeservices = Object.entries(rme.config.services);
  for (const [serviceslug, serviceconfig] of runtimeservices) {
    const prototype = rme.register.services[serviceslug];
    const instance = await prototype.client(serviceconfig);
    rme.instance.service[serviceslug] = instance;
  }
}
export async function twitches(rme, daemon) {
  for (const handler of Object.values(ontology.populate)) await handler(rme);
  for (const handler of Object.values(ontology.resolve)) await handler(rme);
}

//   if (rme.register.modules.domain.lifecycle.construct)
//     await rme.register.modules.domain.lifecycle.construct(rme.instance);
