import { Path } from "@vivalence/typology";
import { Module, Entity, Repository } from "../prototypes/index.js";

class Valence extends Entity {}
class Intent extends Entity {}
class Session extends Entity {}

const entities = {
  intent: { prototype: Intent },
  session: { prototype: Session },
  module: {
    prototype: Module,
    lifecycle: (runtime) => async (module) => {
      module.path = runtime.path //
        .branch(`/module/${module.type}/${module.slug}`);
      module.call = runtime.call.branch(module.path.value);
      module.manifest = await module.call("/manifest");
      if (module.implements("VIEWABLE"))
        module.view = await module.call("/view");
    },
  },
  valence: {
    prototype: Valence,
    lifecycle: (runtime) => async (valence) => {
      valence.module = await runtime.entities.module.spawn(valence.module);
    },
  },
};

export async function lifecycle(runtime, client) {
  for (const [type, entity] of Object.entries(entities)) {
    if (entity.lifecycle) entity.lifecycle = entity.lifecycle(runtime);
    runtime.entities[type] = new Repository(entity);
  }

  runtime.manifest = await runtime.call("/manifest");
  runtime.path = new Path(`/runtime/${runtime.manifest.slug}`);

  const valences = await runtime.call("/entities/valence/find");
  for (const valence of valences) {
    await runtime.entities.valence.spawn(valence);
  }
}

// console.log(lighthouse.connection.status.code.get());
// console.log(lighthouse.authority.get(), lighthouse.identity.get());
