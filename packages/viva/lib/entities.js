import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations"; // or `@mikro-orm/migrations-mongodb`

import config from "@vivalence/config";
import { schemas } from "@vivalence/schema";

async function entities(viva) {
  const orm = await MikroORM.init(
    defineConfig({
      dbName: config.env.get("VIVA_DATABASE_PATH"),
      entities: schemas,
      extensions: [Migrator],

      migrations: {
        tableName: config.env.get("VIVA_DATABASE_MIGRATIONS_TABLE"),
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

  viva.entities = { orm, em: orm.em.fork() };

  return viva;
}

export default entities;
