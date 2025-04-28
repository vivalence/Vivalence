// import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
// import { Migrator } from "@mikro-orm/migrations"; // or `@mikro-orm/migrations-mongodb`

// import config from "@vivalence/config";
import { schemas, repositories } from "@vivalence/schema";

async function init(daemon) {
  // const orm = await MikroORM.init(
  //   defineConfig({
  //     dbName: config.env.get("VIVA_DATABASE_PATH"),
  //     entities: schemas.daemon,
  //     // extensions: [Migrator], migrations: {tableName: config.env.get("VIVA_DATABASE_MIGRATIONS_TABLE"), path: config.env.get("VIVA_DATABASE_MIGRATIONS_PATH"),},
  //   }),
  );

  // const migrator = orm.getMigrator();
  // await migrator.createMigration();
  // await migrator.up();

  // // fork.
  // // need to inject request middleware into the runtime.router for em forking.

  // // here is also where i facilitate the domain entity customization,
  // // and the embedded types.

  // daemon.modules = { orm, em: orm.em.fork() };

  // await Object.entries(entities) .filter(([key]) =>
  //     ["user", "repoo", "daemon", "runtime", "service", "domain", "ontology", "curriculum", "game", "tactic", "strategy",].includes(key),
  //   .map(async ([key, entity]) => {daemon.entities[key] = await daemon.entities.em.getRepository(entity);

  // proxies ?
  // daemon.modules = await new repositories.daemon(daemon.entities);



  // await Promise.all(Object.entries(repositories.daemon).map(async ([key, entity]) => {daemon.entities[key] = await daemon.entities.em.getRepository(entity);}),);

  return daemon;
}

async function schema(daemon) {
  // const migrator = orm.getMigrator();
  // await migrator.createMigration();
  // await migrator.up();
  // return daemon;
}

export default { init };
