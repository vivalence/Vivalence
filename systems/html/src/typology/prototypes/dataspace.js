import { RemoteEntityManager, Vector, shape, shard } from "@vivalence/typology";

function nameFrom(schema) {
  return (
    schema.name ??
    (typeof schema.kind === "function" ? schema.kind().name.toLowerCase() : "unknown")
  );
}

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

export class Dataspace {
  schemas = new Map();

  constructor({ entities, connection, seed }) {
    this.connection = connection;
    this.em = new RemoteEntityManager(connection, {});

    for (const dossier of entities) {
      const name = nameFrom(dossier);
      const repository = dossier.repository(dossier, this);

      const vector = new Vector()
        .use(shard.context.attach("dossier", dossier))
        .use(shard.context.attach("repository", repository))
        .use(shard.context.attach("dataspace", this));
      seed?.(vector);
      for (const fn of dossier.use ?? []) vector.use(fn);
      vector.affect(async () => {});
      const integrate = shape.selbstbestimmt(vector, strategy);

      if (repository.manage) this.em.register(name, repository, integrate);
      else repository.integrate = integrate;
      this.schemas.set(name, dossier);
      this[name] = repository;
    }
  }

  async init() {
    if (!this.connection) return;
    this.datamap = await this.connection.call("/datamap");
    this.em.schema = this.datamap;
  }

  async populate(names = []) {
    await Promise.all(
      names
        .filter((name) => this.em.repositoryMap[name])
        .map((name) => this.em.repositoryMap[name].find()),
    );
  }

  fork() {
    return this.em.fork();
  }
}
