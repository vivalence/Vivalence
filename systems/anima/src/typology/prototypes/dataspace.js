import { RemoteEntityManager, Vector, shape, shard } from "@vivalence/typology";

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

// ugly retarded slop
export class Dataspace {
  schemas = new Map();

  constructor({ entities, connection, seed }) {
    this.connection = connection;
    this.em = new RemoteEntityManager(connection, {});

    for (const dossier of entities) {
      const repository = dossier.repository(dossier, this);

      const boot = new Vector()
        .use(shard.context.attach("dossier", dossier))
        .use(shard.context.attach("repository", repository))
        .use(shard.context.attach("dataspace", this));

      if (seed) seed(boot);
      if (dossier.boot) boot.slurp(dossier.boot);

      for (const fn of dossier.use ?? []) boot.use(fn);
      boot.affect(async () => {});

      const integrate = shape.selbstbestimmt(boot, strategy);
      if (repository.manage) this.em.register(dossier.name, repository, integrate);
      else repository.integrate = integrate;

      this.schemas.set(dossier.name, dossier);
      this[dossier.name] = repository;
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
