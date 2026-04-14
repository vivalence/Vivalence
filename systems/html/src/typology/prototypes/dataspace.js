import { RemoteEntityManager, RemoteRepository, Vector, shape, steer } from "@vivalence/typology";

function nameFrom(schema) {
  return schema.name ?? (typeof schema.kind === "function" ? schema.kind().name.toLowerCase() : "unknown");
}

async function defaultCast(ctx) {
  const kind = typeof ctx.schema.kind === "function" ? ctx.schema.kind() : null;
  ctx.entity = await ctx.em.cast(ctx.name, ctx.raw, kind);
}

function compileSchema(schema, dataspace, name, factory) {
  const vector = new Vector();

  vector.use(async (ctx, next) => {
    ctx.schema = schema;
    ctx.name = name;
    ctx.em = dataspace.em;
    ctx.dataspace = dataspace;
    await next();
  });

  for (const fn of schema.use ?? []) vector.use(fn);
  vector.affect(schema.cast ?? defaultCast);

  return shape.selbstbestimmt(vector, factory);
}

export class Dataspace {
  schemas = new Map();

  constructor({ entities, connection, factory }) {
    this.connection = connection;
    this.em = new RemoteEntityManager(connection, {});

    for (const schema of entities) {
      const name = nameFrom(schema);
      const Repository = schema.repository?.() ?? RemoteRepository;
      const repo = new Repository(schema.kind?.() ?? null);
      const repoConnection = schema.remote?.connection ?? connection;
      repo.connect(repoConnection.branch(schema.remote.endpoint));
      this.em.register(name, repo);

      repo.hydrate = compileSchema(schema, this, name, factory);
      repo.dataspace = this;
      this.schemas.set(name, schema);
      this[name] = repo;
    }
  }

  async init() {
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
