// limit: 2200 chars · what mikro GENERATES for a typology tree against a copy of his mountpoint, as boot does
// (commons/datamaps/libsql/libsql.viva.js:32). args: <typology dir> <mountpoint copy> <db file> [up]
import { defineConfig, MikroORM } from "@mikro-orm/sqlite";
import { Migrator } from "@mikro-orm/migrations";

const [typology, mountpoint, file, act] = Deno.args;
const { sets } = await import(`file://${typology}/entities/index.ts`);

const schemas = [
  ...new Set(
    [sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]
      .flatMap((tier) => Object.values(tier))
      .map((descriptor) => descriptor.schema),
  ),
];
console.log("schemas", schemas.map((schema) => schema.meta.className).join(" "));

const orm = await MikroORM.init(
  defineConfig({
    dbName: `${mountpoint}/${file}`,
    loadStrategy: "balanced",
    entities: schemas,
    extensions: [Migrator],
    migrations: {
      tableName: "_mikro_migrations",
      path: `${mountpoint}/migrations`,
      transactional: false,
      snapshotOnMigrate: false,
    },
  }),
);

const before = new Set([...Deno.readDirSync(`${mountpoint}/migrations`)].map((entry) => entry.name));
const differs = await orm.migrator.checkSchema();
console.log("checkSchema", differs);

if (differs) {
  await orm.migrator.create();
  for (const entry of Deno.readDirSync(`${mountpoint}/migrations`)) {
    if (before.has(entry.name) || entry.name.startsWith(".")) continue;
    console.log(`== generated ${entry.name}`);
    console.log(Deno.readTextFileSync(`${mountpoint}/migrations/${entry.name}`));
  }
}

const pending = await orm.migrator.getPending();
console.log("pending", pending.map((migration) => migration.name).join(" "));

if (act === "up" && pending.length) {
  await orm.migrator.up();
  console.log("up done");
}

await orm.close(true);
