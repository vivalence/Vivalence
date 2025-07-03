import config from "@vivalence/config";

import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import * as path from "@std/path";

export default function entities(daemon: Daemon) {
  return async (runtime: any) => {
    const { db } = runtime.config.services.database.config;
    const orm = await MikroORM.init(
      defineConfig({
        dbName: db.path,
        entities: runtime.domain.entities.database,
        extensions: [Migrator],
        strict: false,
        migrations: {
          tableName: "_mikro_migrations",
          path: path.join(db.dir, "migrations"),
        },
      }),
    );

    const migrator = orm.getMigrator();
    await migrator.createMigration();
    await migrator.up();

    runtime.entities = { orm, em: orm.em.fork() };

    await Promise.all(
      Object.entries(runtime.domain.entities.entities).map(
        async ([key, entity]) => {
          runtime.entities[key] =
            await runtime.entities.em.getRepository(entity);
        },
      ),
    );

    return runtime;
  };
}
