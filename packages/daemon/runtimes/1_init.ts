import { Daemon, Module, UnknownObject } from "@vivalence/types";
import { services as servicesHelper } from "@vivalence/shared";
import { schemas, entities } from "@vivalence/schema";

import executionMiddleware from "./lib/executionMiddleware.ts";

import createEmitter from "../emitter/create.js";
import createRouter from "../server/router/create.js";

export default async function (daemon: Daemon) {
  for (let [key, runtime] of daemon.runtimes.entries()) {
    try {
      runtime = Object.assign(runtime, {
        entities: {},
        schema: {},
        services: {},
        locals: {},
        router: createRouter(),
        bus: createEmitter(),
        ctx: {},
      });

      // Todo: make schema a Module.export and apply them to mikro.Embeddables.
      // const { Ontology, Corpora } = runtime.Modules;
      // runtime.schema = [Ontology, ...Corpora].reduce((s, { schema = (s: UnknownObject) => s }) => typeof schema === "function" ? (schema(s) ?? s) : s, {},);

      // maybe pass the service Modules
      const services = await servicesHelper.mountClients(runtime.Modules.Runtime.services, runtime);
      runtime.services = Object.assign({}, daemon.services, services);

      // executionMiddleware(runtime, daemon);

      // maybe this goes later.
      runtime.entities = { em: daemon.entities.em.fork() };
      await Object.entries(entities)
        .filter(([key]) =>
          [
            "user",
            // "daemon",
            "runtime",
            "service",
            "domain",
            "ontology",
            "curriculum",
            "game",
            "tactic",
            "strategy",
          ].includes(key),
        )
        .map(async ([key, entity]) => {
          runtime.entities[key] = await runtime.entities.em.getRepository(entity);
        });

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }

  return daemon;
}
