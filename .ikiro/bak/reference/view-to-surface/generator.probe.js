// limit: 3200 chars · can a declaration written TODAY shape a migration mikro has not generated yet? A custom
// `migrations.generator` receives the diff before the file is written; a rename map turns drop + create into renames.
// args: <renamed typology dir> <mountpoint copy> <db file>
import { defineConfig, MikroORM } from "@mikro-orm/sqlite";
import { Migrator, TSMigrationGenerator } from "@mikro-orm/migrations";

const [typology, mountpoint, file] = Deno.args;
const { sets } = await import(`file://${typology}/entities/index.ts`);

const RENAMED = {
  tables: [
    ["View", "Surface"],
    ["buffer_views", "buffer_surfaces"],
  ],
  columns: [
    ["File", "view", "surface"],
    ["buffer_surfaces", "view_id", "surface_id"],
  ],
};

class Renaming extends TSMigrationGenerator {
  generateMigrationFile(className, diff) {
    console.log("generator saw up statements:", diff.up.filter(Boolean).length);
    const up = [
      ...RENAMED.tables.map(([from, to]) => `alter table \`${from}\` rename to \`${to}\`;`),
      ...RENAMED.columns.map(([table, from, to]) => `alter table \`${table}\` rename column \`${from}\` to \`${to}\`;`),
    ];
    return super.generateMigrationFile(className, { up, down: [] });
  }
}

const schemas = [
  ...new Set(
    [sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]
      .flatMap((tier) => Object.values(tier))
      .map((descriptor) => descriptor.schema),
  ),
];

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
      generator: Renaming,
    },
  }),
);

const heard = [];
orm.migrator.on("migrating", (event) => heard.push(`migrating ${event.name}`));
orm.migrator.on("migrated", (event) => heard.push(`migrated ${event.name}`));

const before = new Set([...Deno.readDirSync(`${mountpoint}/migrations`)].map((entry) => entry.name));
console.log("checkSchema", await orm.migrator.checkSchema());
await orm.migrator.create();
for (const entry of Deno.readDirSync(`${mountpoint}/migrations`)) {
  if (before.has(entry.name) || entry.name.startsWith(".")) continue;
  console.log(`== generated ${entry.name}`);
  console.log(Deno.readTextFileSync(`${mountpoint}/migrations/${entry.name}`));
}
await orm.migrator.up();
console.log("events", heard.join(" · "));
console.log("checkSchema after", await orm.migrator.checkSchema());
console.log("== residue: what the DB still needs to equal the entities");
console.log(await orm.schema.getUpdateSchemaSQL({ wrap: false }));
await orm.close(true);
