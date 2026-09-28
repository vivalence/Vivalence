import { RequestContext } from "@mikro-orm/core";
import { defineConfig, MikroORM } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";

export class Datamap {
  constructor(orm) {
    this.orm = orm;
    this.entities = { em: orm.em };
    for (const meta of Object.values(orm.getMetadata().getAll())) {
      if (meta.abstract || meta.pivotTable || meta.embeddable) continue;
      this.entities[meta.className.toLowerCase().replace("entity", "")] = orm.em.getRepository(meta.class);
    }
    this.shard = {
      scope: (task) => RequestContext.create(orm.em, task),
      bind: (name, resolve) => async (ctx, next) => {
        RequestContext.getEntityManager(orm.em.name)?.setFilterParams(name, resolve(ctx));
        await next();
      },
      carry: () => {
        const context = RequestContext.currentRequestContext();
        return (task) => (context ? RequestContext.storage.run(context, task) : task());
      },
    };
  }

  getMetadata() {
    return this.orm.getMetadata();
  }

  registerSubscriber(subscriber) {
    this.orm.em.getEventManager().registerSubscriber(subscriber);
  }

  close() {
    return this.orm.close();
  }
}

export const manifest = { type: "datamap", slug: "libsql", name: "libsql" };

export const config = (datamap, options = {}) => {
  const seat = datamap.mountpoint?.branch(datamap.statics.db.file).absolute;
  const contextName = datamap.statics?.context?.name ?? datamap.statics?.db?.file;
  return defineConfig({
    dbName: seat ?? ":memory:",
    loadStrategy: "balanced",
    ...(contextName && { contextName }),
    ...(seat && {
      extensions: [Migrator],
      migrations: { tableName: "_mikro_migrations", path: datamap.mountpoint.branch("migrations").absolute, transactional: false },
    }),
    ...options,
  });
};

export const provider = async (datamap, options) => {
  const orm = await MikroORM.init(config(datamap, options));
  if (orm.config.get("dbName") === ":memory:") await orm.schema.createSchema();
  else {
    const migrator = orm.getMigrator();
    if (await migrator.checkMigrationNeeded()) await migrator.createMigration();
    if ((await migrator.getPendingMigrations()).length) await migrator.up();
  }
  return new Datamap(orm);
};
