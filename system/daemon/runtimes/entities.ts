import { MikroORM, defineConfig, FlushMode } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import * as path from "@std/path";

import config from "@vivalence/config";

export default function entities(daemon: Daemon) {
  return async (runtime: any) => {
    const { domain, services } = runtime.config;

    const orm = await MikroORM.init(
      defineConfig({
        dbName: services.database.config.filePath,
        entities: domain.entities.database,
        extensions: [Migrator],
        pool: {
          // afterCreate: (conn: any, done: any) => {
          beforeCreate: (conn: any, done: any) => {
            const filePath = daemon.services.database.config.filePath;
            conn.run(`ATTACH DATABASE '${filePath}' AS daemon;`);
            console.log(`ATTACH DATABASE '${filePath}' AS daemon`);
            done(null, conn);
          },
        },
        strict: false,
        migrations: {
          tableName: "_mikro_migrations",
          path: path.join(
            path.dirname(services.database.config.filePath),
            "migrations",
          ),
        },
      }),
    );

    const migrator = orm.getMigrator();
    await migrator.createMigration();
    await migrator.up();

    runtime.entities = { orm, em: orm.em.fork() };

    await Promise.all(
      Object.entries(domain.entities.entities).map(async ([key, entity]) => {
        runtime.entities[key] = await runtime.entities.em.getRepository(entity);
      }),
    );

    const users = await runtime.entities.user.find();
    console.log("users ", users);

    return runtime;
  };
}
