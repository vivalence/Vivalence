import { defineConfig, MikroORM } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";
import { Datamap } from "@vivalence/typology";
import * as migrate from "./migrate.js";

const manifest = {
  type: "datamap",
  slug: "libsql",
  name: "libsql",
};

const config = (datamap, { twitch, ...options } = {}) => {
  const seat = datamap.mountpoint?.branch(datamap.statics.db.file).absolute;
  const contextName = datamap.statics?.context?.name ?? datamap.statics?.db?.file;
  return defineConfig({
    dbName: seat ?? ":memory:",
    loadStrategy: "balanced",
    ...(contextName && { contextName }),
    ...(seat && {
      extensions: [Migrator],
      migrations: {
        tableName: "_mikro_migrations",
        path: datamap.mountpoint.branch("migrations").absolute,
        transactional: false,
        snapshotOnMigrate: true,
        fileName: migrate.named,
        generator: migrate.generator(twitch),
      },
    }),
    ...options,
  });
};

async function provider(datamap, options) {
  const orm = await MikroORM.init(config(datamap, options));
  const held = new Datamap(orm);
  if (orm.config.get("dbName") === ":memory:") await orm.schema.create();
  else {
    const migrator = orm.migrator;
    const read = (sql) => orm.em.getConnection().execute(sql);
    const stood = migrate.reached(await migrator.getExecuted(), datamap.version);
    const arrived = stood !== datamap.version;
    options.twitch.branch("/before/datamap/migrate").use(migrate.before(read, arrived));
    options.twitch.branch("/after/datamap/migrate").use(migrate.after(orm, datamap.version));

    for (const release of migrate.releases(options.twitch, stood, datamap.version)) {
      await migrator.create(undefined, true, false, `vivalence@${release}`);
      held.migrated.push(...(await migrator.up()).map((migration) => migration.name));
      await options.twitch.dispatch(`/after/datamap/migrate/${release}`, { release });
    }

    const differs = await migrator.checkSchema();
    if (differs || arrived) {
      await migrator.create(undefined, !differs, false, `vivalence@${datamap.version}`);
    }
    held.migrated.push(...(await migrator.up()).map((migration) => migration.name));
    if (arrived) {
      await options.twitch.dispatch(`/after/datamap/migrate/${datamap.version}`, {
        release: datamap.version,
      });
    }
  }
  return held;
}

export { config, manifest, provider };
