// populate is for tools, maps and repositories
import { Vector } from "@vivalence/vector";
import { Module } from "@vivalence/typology/prototypes";
import * as lib from "./lib/index.js";

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
  //
}

export async function modules(rme, daemon) {
  for (const [type, { prototype }] of Object.entries(rme.maps.modules)) {
    if (!rme.register.modules[type]) continue; // domain defines unconfigured module
    rme.instance.module[type] = {};
    for (const register of rme.register.modules[type]) {
      const module = new prototype(register);
      module.path = rme.path.branch(`/module/${module.type}/${module.slug}`);
      module.url = new URL(module.path, daemon.config.url);
      rme.instance.module[type][register.manifest.slug] = module;
    }
  }
  rme.instance.module.values = () =>
    Object.values(rme.instance.module)
      .map((type) => Object.values(type))
      .flat();

  for (const module of rme.instance.module.values()) {
    const entity = { slug: module.slug, type: module.type };
    module.entity = await rme.instance.entities.module.findOne(entity);
    if (!module.entity)
      module.entity = rme.instance.entities.module.create(entity);
    // module.entity.traits = module.traits;
  }

  await rme.instance.entities.em.flush();
}

export async function domain(rme, daemon) {
  if (rme.register.domain.lifecycle.construct)
    await rme.register.domain.lifecycle.construct(rme.instance);
}

export async function lighthouse(rme, daemon) {
  rme.instance.lighthouse = await rme.register.lighthouse //
    .client(rme.config.lighthouse, rme.instance.entities.user);
}

export function topologies(rme) {
  const topologies = [rme.register.ontology.topology];
  rme.register.modules.topic.map((t) => topologies.push(t.topology));
  // TODO filter modules by trait topological.
  // ie.: topologies = rme.instance.modules.values().filter(implements('topological')).map(t=>t.topology)

  for (const topology of topologies) {
    if (topology.dimensions)
      topology.dimensions //
        .map((d) => rme.instance.ontology.dimension.create(d));

    if (topology.topographies) {
      topology.topographies //
        .map((t) => rme.instance.ontology.topography.create(t));
    }

    if (topology.constraints)
      topology.constraints //
        .map((c) => rme.instance.ontology.constraint.create(c));

    if (topology.remedies)
      topology.remedies.map((r) => rme.instance.ontology.medic.register(r));

    if (topology.receptors) {
      topology.receptors.entries().forEach(([form, parsers]) => {
        parsers.map((parser) =>
          rme.instance.ontology.taxonomist.on(form, parser),
        );
      });
    }
  }
}

export async function services(rme, daemon) {
  const runtimeservices = Object.entries(rme.config.services);
  for (const [serviceslug, serviceconfig] of runtimeservices) {
    const prototype = rme.register.services[serviceslug];
    const instance = await prototype.client(serviceconfig);
    rme.instance.service[serviceslug] = instance;
  }
}
