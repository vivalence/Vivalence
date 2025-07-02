import config from "@vivalence/config";

import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { dirname, join } from "@std/path";

import { database, entities } from "@vivalence/entities";

async function init(daemon) {
  const orm = await MikroORM.init(
    defineConfig({
      dbName: config.services.database.config.db.path,
      entities: database,
      extensions: [Migrator],
      strict: false,
      migrations: {
        tableName: "_mikro_migrations",
        path: join(config.services.database.config.db.dir, "migrations"),
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

  // // todo: move to dedicated identity step;
  // async function ensureUser() {
  //   for (const user of daemon.services.identity.seed) {
  //     const count = await daemon.entities.user.count({ id: user.id });
  //     if (count === 0) {
  //       daemon.entities.user.create(user);
  //       await daemon.entities.em.flush();
  //     }
  //   }
  // }
  // await ensureUser();

  return daemon;
}

export default { init };
