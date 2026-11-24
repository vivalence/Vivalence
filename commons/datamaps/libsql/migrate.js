import { TSMigrationGenerator } from "@mikro-orm/migrations";
import { steer } from "@vivalence/typology";
import { compare, parse } from "@std/semver";

const creates = (table) => (sql) => sql.startsWith(`create table \`${table}\` `);

const drops = (table) => (sql) => sql.startsWith(`drop table if exists \`${table}\``);

export const before = (read, arrived) => async (ctx, next) => {
  if (!arrived) return;

  const diff = ctx.input;

  ctx.migrate = {
    read,
    sql: (statement) => diff.up.push(statement),

    async renaming(from, to) {
      const standing = await read(
        `select name from sqlite_master where type = 'table' and name = '${from}'`,
      );
      if (!standing.length) return;

      const declared = `type = 'index' and tbl_name = '${from}' and sql is not null`;
      const indexes = await read(`select name from sqlite_master where ${declared}`);
      const statements = [
        `alter table \`${from}\` rename to \`${to}\`;`,
        ...indexes.map((index) => `drop index \`${index.name}\`;`),
      ];

      const kept = diff.up.filter((statement) => !drops(from)(statement));
      const swapped = kept.flatMap((statement) =>
        creates(to)(statement) ? statements : [statement],
      );

      diff.up = kept.some(creates(to)) ? swapped : [...statements, ...kept];
    },
  };

  await next();
};

export const after = (orm, version) => async (ctx, next) => {
  const em = orm.em.fork();
  const sql = (statement, values) => em.getConnection().execute(statement, values);

  ctx.migrate = {
    read: sql,
    sql,

    async mapping(table, change) {
      const typed = await sql(`select name from pragma_table_info('${table}') where type = 'json'`);
      const json = typed.map((column) => column.name);

      for (const stored of await sql(`select * from \`${table}\``)) {
        const parsed = Object.fromEntries(json.map((name) => [name, JSON.parse(stored[name])]));
        const changed = change({ ...stored, ...parsed });
        const names = Object.keys(changed);
        if (!names.length) continue;

        const values = names.map((name) =>
          json.includes(name) ? JSON.stringify(changed[name]) : changed[name],
        );
        const setting = names.map((name) => `\`${name}\` = ?`).join(", ");
        await sql(`update \`${table}\` set ${setting} where id = ?`, [...values, stored.id]);
      }
    },
  };
  if (ctx.input.release === version) ctx.em = em;

  await next();
};

export const generator = (twitch) =>
  class extends TSMigrationGenerator {
    async generate(diff, path, name) {
      const [, release] = name.split("@");
      await twitch.dispatch(`/before/datamap/migrate/${release}`, diff);
      return super.generate(diff, path, name);
    }
  };

export const named = (timestamp, name) => `Migration${timestamp}_${name}`;

export const reached = (executed, version) => {
  if (!executed.length) return version;

  const stamped = executed.map((migration) => migration.name.split("@")[1]).filter(Boolean);
  return stamped.length ? stamped.at(-1) : "0.0.0";
};

export const releases = (twitch, stood, version) =>
  [
    ...new Set(
      steer.trie
        .leaves(twitch)
        .filter((leaf) => leaf.steps.at(-2)?.nature === "migrate")
        .map((leaf) => leaf.pattern.nature),
    ),
  ]
    .filter((release) => compare(parse(release), parse(stood)) > 0)
    .filter((release) => compare(parse(release), parse(version)) < 0)
    .sort((left, right) => compare(parse(left), parse(right)));
