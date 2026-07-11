import { MikroORM, defineConfig, FlushMode, RequestContext } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
// import * as libsql from "@libsql/client/node";

const manifest = {
  type: "datamap",
  slug: "libsql",
  name: "libsql",
};

async function provider(datamap, variant) {
  const mikroconfig = defineConfig({
    dbName: datamap.mount.branch(datamap.statics.db.file).absolute,
    entities: variant.map((v) => v.schema).filter(Boolean),
    subscribers: variant
      .map((v) => v.subscriber)
      .filter(Boolean)
      .map((S) => new S()),
    extensions: [Migrator],
    migrations: {
      tableName: "_mikro_migrations",
      path: datamap.mount.branch("migrations").absolute,
      transactional: false,
    },
  });

  const orm = await MikroORM.init(mikroconfig);

  const migrator = orm.getMigrator();
  if (await migrator.checkMigrationNeeded()) await migrator.createMigration();
  const pending = await migrator.getPendingMigrations();
  if (pending.length > 0) await migrator.up();

  // const repositories = {};
  // for (const { type, schema, entity } of variant) {
  //   if (!entity || !type) continue;
  //   repositories[type] = orm.em.getRepository(entity);
  // }
  // return { orm, repositories, entities: repositories };

  const entities = { em: orm.em };
  for (const { type, schema, entity } of variant) {
    if (!entity || !type) continue;
    entities[type] = orm.em.getRepository(entity);
  }

  return {
    entities,
    shard: {
      context: (fn) => RequestContext.create(orm.em, fn), // to be depracated
      scope: (fn) => RequestContext.create(orm.em, fn),
      bind: (name, resolve) => async (ctx, next) => {
        RequestContext.getEntityManager()?.setFilterParams(name, resolve(ctx));
        await next();
      },
      // @beef hacky deep wire — carry the LIVE request context into a lazy streaming body
      // (datamap.inject re-wraps the response so each pull runs `within`). re-ENTER the same fork
      // via storage.run — never RequestContext.create, which forks a fresh identity map and would
      // strand the parent turn.
      carry: () => {
        const context = RequestContext.currentRequestContext();
        return (fn) => (context ? RequestContext.storage.run(context, fn) : fn());
      },
    },
    subscribe: (sub) => orm.em.getEventManager().registerSubscriber(sub),
    introspect: () => orm.getMetadata(),
    disintegrate: () => orm.close(),
  };
}

export { manifest, provider };
