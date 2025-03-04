import { Daemon } from "@vivalence/types";
import { runtimeEntities } from "@vivalence/schema";
import { RuntimeEntity, entities } from "@vivalence/schema";

function loadModuleEntities(value) {
  if (Array.isArray(value)) {
    value.forEach(loadModuleEntities);
  } else if (typeof value === "object" && value !== null && !value.manifest) {
    Object.values(value).forEach(loadModuleEntities);
  } else if (typeof value === "object" && value !== null && value.manifest && value.manifest.type) {
    value.Entity = entities[value.manifest.type];
  } else {
    throw new Error("Invalid module format");
  }
}

export default function loadRuntimeEntities(daemon: Daemon) {
  return async (runtime: any) => {
    loadModuleEntities(runtime.Modules);

    runtime.entities = { em: daemon.entities.orm.em.fork() };

    await Promise.all(
      Object.entries(runtimeEntities).map(async ([key, entity]) => {
        runtime.entities[key] = await runtime.entities.em.getRepository(entity);
      }),
    );
    return runtime;
  };
}

// const orm = await MikroORM.init(
//   defineConfig({
//     dbName: daemon.entities.orm.config.options.dbName,
//     entities: schemas,
//     // debug: true,
//   }),
// );
