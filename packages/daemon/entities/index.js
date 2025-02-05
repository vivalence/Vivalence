import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations"; // or `@mikro-orm/migrations-mongodb`

import config from "@vivalence/config";
import { schemas, entities } from "@vivalence/schema";

async function init(daemon) {
  const orm = await MikroORM.init(
    defineConfig({
      dbName: config.env.get("VIVA_DATABASE_PATH"),
      entities: schemas,

      extensions: [Migrator],
      discovery: { warnWhenNoEntities: false },
      multipleStatements: true,
      // debug: true,

      migrations: {
        tableName: "_mikro_migrations",
        path: config.env.get("VIVA_DATABASE_MIGRATIONS_PATH"),
        glob: "!(*.d).{js,ts}", // how to match migration files (all .js and .ts files, but not .d.ts)
        transactional: true, // wrap each migration in a transaction
        disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
        allOrNothing: true, // wrap all migrations in master transaction
        dropTables: true, // allow to disable table dropping
        safe: false, // allow to disable table and column dropping
        snapshot: true, // save snapshot when creating new migrations
        emit: "ts", // migration generation mode
        // generator: TSMigrationGenerator, // migration generator, e.g. to allow custom formatting
      },
    }),
  );

  const migrator = orm.getMigrator();
  await migrator.createMigration();
  await migrator.up();

  // fork.
  // need to inject request middleware into the runtime.router for em forking.

  // here is also where i facilitate the domain entity customization,
  // and the embedded types.

  daemon.entities = { orm, em: orm.em.fork() };

  await Object.entries(entities)
    .filter(([key]) =>
      [
        "user",
        "repoo",
        "daemon",
        "runtime",
        "service",
        "domain",
        "ontology",
        "curriculum",
        "game",
        "tactic",
        "strategy",
      ].includes(key),
    )
    .map(async ([key, entity]) => {
      daemon.entities[key] = await daemon.entities.em.getRepository(entity);
    });

  return daemon;
}

async function schema(daemon) {
  // const migrator = orm.getMigrator();
  // await migrator.createMigration();
  // await migrator.up();
  // return daemon;
}

export default { init };
