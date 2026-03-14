import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import * as libsql from "@libsql/client/node";

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
    },
  });

  const orm = await MikroORM.init(mikroconfig);

  const migrator = orm.getMigrator();
  if (await migrator.checkMigrationNeeded()) await migrator.createMigration();
  const pending = await migrator.getPendingMigrations();
  if (pending.length > 0) await migrator.up();
  // const migrator = orm.getMigrator(); await migrator.createMigration(); await migrator.up();

  const entities = {};
  for (const { type, schema, entity } of variant) {
    if (!entity || !type) continue;
    entities[type] = orm.em.getRepository(entity);
  }

  return { orm, entities };
}

export { manifest, provider };
