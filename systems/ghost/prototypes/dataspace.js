import { RemoteEntityManager, RemoteRepository, Vector, shape, shard } from "@vivalence/typology";

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

const RUNG = ["mode", "literal", "symbol"];

export class Dataspace {
  schemas = new Map();

  constructor({ entities, connection, runtime, seed }) {
    this.connection = connection;
    this.runtime = runtime;
    this.em = new RemoteEntityManager(connection, {});

    for (const dossier of entities) {
      const repository = dossier.repository(dossier, this);

      const boot = new Vector()
        .use(shard.context.attach("dossier", dossier))
        .use(shard.context.attach("repository", repository))
        .use(shard.context.attach("dataspace", this));

      seed(boot);
      for (const middleware of dossier.use) boot.use(middleware);
      boot.do(async () => {});

      const integrate = shape.selbstbestimmt(boot, strategy);
      if (repository.manage) this.em.register(dossier.name, repository, integrate);
      else repository.integrate = integrate;
      this.schemas.set(dossier.name, dossier);
      this[dossier.name] = repository;
    }
  }

  async init() {
    this.datamap = await this.connection.call("/metadata/datamap");
    this.em.schema = this.datamap;
  }

  async populate(names) {
    for (const name of names.filter((name) => this.em.repositoryMap[name])) await this.em.repositoryMap[name].find();
  }

  rung(connection) {
    return Object.fromEntries(
      RUNG.map((name) => {
        const repository = new RemoteRepository(this.schemas.get(name).kind()).connect(connection.branch(`/entities/${name}`));
        return [name, repository.manage(this.em, name)];
      }),
    );
  }

  fork() {
    return this.em.fork();
  }
}
