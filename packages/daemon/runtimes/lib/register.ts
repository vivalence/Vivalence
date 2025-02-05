import { strings } from "@vivalence/shared";
import { Daemon, Manifest, Module, Runtime } from "@vivalence/types";

import { entities, enums } from "@vivalence/schema";

export function registerModules(daemon: Daemon, runtime: Runtime, modules: Module[]) {
  return Promise.all(modules.map((Module) => registerModule(daemon, runtime, Module)));
}

export async function registerModule(
  daemon: Daemon,
  runtime: Runtime,
  Module: Module,
): Promise<Module> {
  // const user = await runtime.services.identity.getUser();

  let entity = await findModule(daemon, runtime, Module);

  if (!entity) {
    entity = await createModule(daemon, runtime, Module);
  } else if (Module.manifest.version && entity.version !== Module.manifest.version) {
    entity = await updateModule(daemon, runtime, Module, entity);
  }

  Module.entity = entity;

  return Module;
}

async function findModule(daemon: Daemon, runtime: Runtime, Module: Module) {
  const moduleQuery = { slug: Module.manifest.slug };
  if (!["runtime"].includes(Module.manifest.type)) {
    moduleQuery["runtime"] = runtime.entity.id;
  }
  let moduleEntity = await daemon.entities.em.findOne(Module.Entity, moduleQuery);
  return moduleEntity as any;
}

async function createModule(daemon: Daemon, runtime: Runtime, Module: ModuleInstaller) {
  let insert: Record<string, unknown> = {
    ...Module.manifest,
    config: { manifest: Module.manifest },
  };

  if (!["runtime"].includes(Module.manifest.type)) {
    insert.runtime = runtime.entity;
  }

  if (["runtime"].includes(Module.manifest.type)) {
    insert.config = {
      ...insert.config,
      services: Module.services,
      statics: Module.statics,
    };
  }

  if (["runtime", "curriculum"].includes(Module.manifest.type)) {
    insert.config = { ...insert.config, modules: Module.modules };
  }

  if (["tactic", "game", "strategy"].includes(Module.manifest.type)) {
    insert = { ...insert, ...Module.data };
  }

  const entity = daemon.entities.em.create(Module.Entity, insert);
  await daemon.entities.em.flush();
  return entity;
}

async function updateModule(daemon: Daemon, runtime: Runtime, Module: Module, entity: any) {
  let update: Record<string, unknown> = {
    id: entity.id,
    ...Module.manifest,
    config: { manifest: Module.manifest },
  };

  if (["runtime"].includes(Module.manifest.type)) {
    update.config = {
      ...update.config,
      services: Module.services,
      statics: Module.statics,
    };
  }

  if (["runtime", "curriculum"].includes(Module.manifest.type)) {
    update.config = { ...update.config, modules: Module.modules };
  }

  if (["tactic", "game", "strategy"].includes(Module.manifest.type)) {
    update = { ...update, ...Module.data };
  }

  daemon.entities.em.assign(entity, update);
  await daemon.entities.em.flush();

  return entity as any;
}

// const moduleEntity = daemon.entities.em.create(entities[Module.entity], {
//   ...Module.manifest,
//   manifest: Module.manifest,
//   config: {
//     services: Module.services,
//     modules: Module.modules,
//     statics: Module.statics,
//   },
// });
// console.log("runtimeEntity ", runtimeEntity);
// await daemon.entities.em.flush();
// if (runtimeEntity) {
//   daemon.entities.em.remove(runtimeEntity);
//   await daemon.entities.em.flush();
// }
// runtimeEntity = await daemon.entities.runtime.create({
//   ...Module.manifest,
//   manifest: Module.manifest,
//   config: {
//     services: Module.services,
//     modules: Module.modules,
//     statics: Module.statics,
//   },
// });
// await daemon.entities.em.flush();
// console.log(Module.manifest);
// console.log("runtimeEntity", runtimeEntity);
// console.log("typeof runtimeEntity", typeof runtimeEntity.config);
// daemon.entities.em.remove(runtimeEntity);
// await daemon.entities.em.flush();

// let query = runtime.Services.supabase
//   .from(strings.capitalize(Module.manifest.type))
//   .select(select)
//   .eq("slug", Module.manifest.slug);
// if (!["runtime"].includes(Module.manifest.type)) {
//   query = query.eq("runtimeId", runtime.Module?.manifest.id);
// }
// const { error, data } = await query.single();
// if (error && error.code !== "PGRST116") {
//   throw error;
// }
// return data as Manifest;
