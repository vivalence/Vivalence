import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { dirname, join } from "@std/path";

import config from "@vivalence/config";
import { database, entities } from "@vivalence/schema";

async function init(daemon) {
  const orm = await MikroORM.init(
    defineConfig({
      dbName: daemon.services.database.config.filePath,
      entities: database,
      extensions: [Migrator],
      strict: false,
      migrations: {
        tableName: config.env.get("VIVA_DATABASE_MIGRATIONS_TABLE"),
        path: join(dirname(daemon.services.database.config.filePath), "migrations"),
      },
    }),
  );

  const migrator = orm.getMigrator();
  await migrator.createMigration();
  await migrator.up();

  daemon.entities = { orm, em: orm.em.fork() };

  await Promise.all(
    Object.entries(entities).map(async ([key, entity]) => {
      daemon.entities[key] = await daemon.entities.em.getRepository(entity);
    }),
  );

  return daemon;
}

export default { init };
