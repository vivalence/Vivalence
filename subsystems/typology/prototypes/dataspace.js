import { RemoteEntityManager } from "./entity-manager.js";
import { RemoteRepository } from "./remote-repository.js";
import { Vector } from "./vector.js";
import * as shape from "../gestalten/shape/index.js";
import * as context from "../gestalten/shard/context.js";

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

export class Dataspace {
  constructor({ runtime, entities, seed }) {
    this.runtime = runtime;
    this.em = new RemoteEntityManager(runtime.connection, {});
    for (const [name, entity] of Object.entries(entities)) {
      const repository = entity.repository(this);
      const boot = new Vector().use(context.bind("repository", repository)).use(context.bind("dataspace", this));
      seed(boot);
      boot.graft(entity.hydration).do(async () => {});
      this.em.register(name, repository, shape.selbstbestimmt(boot, strategy));
      this[name] = repository;
    }
  }

  async init() {
    this.datamap = await this.runtime.connection.call(`${this.runtime.reference.absolute}/metadata/datamap`);
    this.em.schema = this.datamap;
  }

  async subscribe() {
    for (const repository of Object.values(this.em.repositoryMap)) await repository.find();
    const offs = Object.values(this.em.repositoryMap).map((repository) => repository.subscribe());
    return () => {
      for (const off of offs) off();
    };
  }

  branch(connection, name) {
    return new RemoteRepository(this.em.repositoryMap[name].kind).connect(connection.branch(`/entities/${name}`)).manage(this.em, name);
  }

  fork() {
    return this.em.fork();
  }
}
