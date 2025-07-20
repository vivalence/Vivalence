import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import * as path from "@std/path";

export default async function (daemon: Daemon, runtime: any) {
  runtime.domain.data = await runtime.register.domain.data(daemon, runtime);

  const mikroconfig = {
    dbName: runtime.config.services.database.config.db.path,
    entities: runtime.domain.data.schema,
    strict: true,

    extensions: [Migrator],
    migrations: {
      tableName: "_mikro_migrations",
      path: path //
        .join(runtime.config.services.database.config.db.dir, "migrations"),
    },
  };

  const orm = await MikroORM.init(defineConfig(mikroconfig));

  const migrator = orm.getMigrator();
  await migrator.createMigration();
  await migrator.up();

  if (runtime.domain.data.subscribers) {
    // runtime.domain.data.subscribers,
    // orm.em.getEventManager().registerSubscriber(this);
  }

  runtime.entities = { orm, em: orm.em.fork() };

  await Promise.all(
    Object.entries(runtime.domain.data.entities).map(async ([key, entity]) => {
      runtime.entities[key] = await runtime.entities.em.getRepository(entity);
    }),
  );

  return runtime;
}
