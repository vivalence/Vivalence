import { RemoteEntityManager, RemoteRepository } from "@vivalence/typology";
import { registry } from "../entities/index.js";

// Dataspace — one per daemon. Equivalent of MikroORM.init().
//
// Creates an RemoteEntityManager, then registers RemoteRepositories
// that delegate identity to the EM. Repos are exposed as direct
// properties: dataspace.mode, dataspace.thread, etc.

export class Dataspace {
  constructor(daemon, schema, endpoints) {
    this.daemon = daemon;
    this.schema = schema;
    this.entityManager = new RemoteEntityManager(daemon.connection, schema);

    for (const [name, endpoint] of Object.entries(endpoints)) {
      const kind = registry[name] ?? null;
      const repository = new RemoteRepository(kind).connect(daemon.connection.branch(endpoint));
      this.entityManager.register(name, repository);
      this[name] = repository;
    }
  }

  fork() { return this.entityManager.fork(); }

  async populate(names = []) {
    await Promise.all(
      names
        .filter((name) => this.entityManager.repositoryMap[name])
        .map((name) => this.entityManager.repositoryMap[name].find()),
    );
  }
}
