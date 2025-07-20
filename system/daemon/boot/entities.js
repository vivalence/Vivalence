import config from "@vivalence/config";

import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { dirname, join } from "@std/path";

import { RuntimeEntity, RuntimeSchema } from "@vivalence/entities";
import { ModuleEntity, ModuleSchema } from "@vivalence/entities";

const entities = { runtime: RuntimeEntity, module: ModuleEntity };
const schema = [RuntimeSchema, ModuleSchema];

async function boot(daemon) {
  const { db } = config.daemon.services.database.config;

  const orm = await MikroORM.init(
    defineConfig({
      dbName: db.path,
      entities: schema,
      extensions: [Migrator],
      strict: false,
      migrations: {
        tableName: "_mikro_migrations",
        path: join(db.dir, "migrations"),
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

export default { boot };
