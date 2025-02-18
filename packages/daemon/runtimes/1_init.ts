import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Daemon, Module, UnknownObject } from "@vivalence/types";
import { services as servicesHelper } from "@vivalence/shared";
import { schemas, entities, runtimeEntities } from "@vivalence/schema";

import injectExecutionMiddleware from "./lib/executionMiddleware.ts";

import createEmitter from "../emitter/create.js";
import createRouter from "../server/router/create.js";

export default async function (daemon: Daemon) {
  for (let [key, runtime] of daemon.runtimes.entries()) {
    try {
      runtime = Object.assign(runtime, {
        entities: {},
        schema: {},
        aperture: {},
        services: {},
        locals: {},
        router: createRouter(),
        bus: createEmitter(),
        ctx: {},
      });

      // Todo: make schema a Module.export and apply them to mikro.Embeddables.
      const { Ontology, Curricula } = runtime.Modules;
      runtime.schema = [Ontology, ...Curricula].reduce(
        (s, { schema = (s: UnknownObject) => s }) =>
          typeof schema === "function" ? (schema(s) ?? s) : s,
        {},
      );

      // maybe pass the service Modules
      const services = await servicesHelper.mountClients(runtime.Modules.Runtime.services, runtime);
      runtime.services = Object.assign({}, daemon.services, services);

      // maybe this goes later.
      runtime.entities = { em: daemon.entities.orm.em.fork() };
      await Promise.all(
        Object.entries(runtimeEntities).map(async ([key, entity]) => {
          runtime.entities[key] = await runtime.entities.em.getRepository(entity);
        }),
      );

      // runtime.aperture.router = runtime.router.create();

      injectExecutionMiddleware(daemon, runtime);

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }

  return daemon;
}

// const orm = await MikroORM.init(
//   defineConfig({
//     dbName: daemon.entities.orm.config.options.dbName,
//     entities: schemas,
//     // debug: true,
//   }),
// );
