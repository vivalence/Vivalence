// import { mw, Vector, parser } from "@vivalence/vector";
// import { bundler, secure, is } from "@vivalence/shared";
// import { maps } from "@vivalence/entities";

export async function services(rme, daemon) {
  const instance = rme.instance;

  for (const service of daemon.services) {
    if (service.runtime === instance.slug) {
      service.client = await service.prototype.client(service);
      instance.services[service.slug] = service.client;
    }
  }
}

// const database = [...daemon.services] //
//   .find(({ slug, runtime }) => slug === "database" && runtime === rme.slug);
// if (!database.implements("DATAMAP")) throw new Error();

// runtime.domain.datamap = await database.prototype //
//   .client(database, datamap);
