import { defineConfig, MikroORM } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { Datamap } from "@vivalence/typology";

const manifest = {
  type: "datamap",
  slug: "libsql",
  name: "libsql",
};

const config = (datamap, options = {}) => {
  const seat = datamap.mountpoint?.branch(datamap.statics.db.file).absolute;
  const contextName = datamap.statics?.context?.name ?? datamap.statics?.db?.file;
  return defineConfig({
    dbName: seat ?? ":memory:",
    loadStrategy: "balanced",
    ...(contextName && { contextName }),
    ...(seat && {
      extensions: [Migrator],
      migrations: { tableName: "_mikro_migrations", path: datamap.mountpoint.branch("migrations").absolute, transactional: false, snapshotOnMigrate: false },
    }),
    ...options,
  });
};

async function provider(datamap, options) {
  const orm = await MikroORM.init(config(datamap, options));
  if (orm.config.get("dbName") === ":memory:") await orm.schema.create();
  else {
    const migrator = orm.migrator;
    if (await migrator.checkSchema()) await migrator.create();
    if ((await migrator.getPending()).length) await migrator.up();
  }
  return new Datamap(orm);
}

export { config, manifest, provider };
