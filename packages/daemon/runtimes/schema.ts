import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import config from "@vivalence/config";
import * as path from "@std/path";
// import * as fs from "@std/fs";

// import { StrategySchema, ServiceSchema } from "@vivalence/schema";
// import { Daemon } from "@vivalence/types";
// import { runtimeEntities } from "@vivalence/schema";
// import { RuntimeEntity } from "@vivalence/schema";
// function loadModuleEntities(value) {if (Array.isArray(value)) {value.forEach(loadModuleEntities);} else if (typeof value === "object" && value !== null && !value.manifest) {Object.values(value).forEach(loadModuleEntities);} else if (typeof value === "object" && value !== null && value.manifest && value.manifest.type) {value.Entity = entities[value.manifest.type];} else {throw new Error("Invalid module format");}}

export default function schema(daemon: Daemon) {
  return async (runtime: any) => {
    const { domain, services } = runtime.config;

    const orm = await MikroORM.init(
      defineConfig({
        dbName: services.database.config.filePath,
        entities: domain.schema.database,
        extensions: [Migrator],
        strict: false,
        migrations: {
          tableName: config.env.get("VIVA_DATABASE_MIGRATIONS_TABLE"),
          path: path.join(path.dirname(services.database.config.filePath), "migrations"),
        },
      }),
    );

    const migrator = orm.getMigrator();
    await migrator.createMigration();
    await migrator.up();

    runtime.entities = { orm, em: orm.em.fork() };

    // await Promise.all(
    //   Object.entries(daemonEntites).map(async ([key, entity]) => {
    //     runtime.entities[key] = await runtime.entities.em.getRepository(entity);
    //   }),
    // );

    return runtime;
  };
}

//
// loadModuleEntities(runtime.Modules);
// runtime.entities = { em: daemon.entities.orm.em.fork() };
// await Promise.all(
//   Object.entries(runtimeEntities).map(async ([key, entity]) => {
//     runtime.entities[key] = await runtime.entities.em.getRepository(entity);
//   }),
// );
// const orm = await MikroORM.init(
//   defineConfig({
//     dbName: daemon.entities.orm.config.options.dbName,
//     entities: schemas,
//     // debug: true,
//   }),
// );
