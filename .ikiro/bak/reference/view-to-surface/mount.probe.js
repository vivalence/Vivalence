// the renamed tree's own datamap, driven as systems/runtime/subjects/runtime/lifecycle/1-population.js drives it:
// the entity twitches grafted, then `provider`. args: <renamed repo> <mountpoint dir> <db file>
import { Path, Twitch } from "@vivalence/typology";
import { sets } from "@vivalence/typology/entities";
import paladin from "@vivalence/paladin";

const [repo, mountpoint, file] = Deno.args;
const { provider } = await import(`file://${repo}/commons/datamaps/libsql/libsql.viva.js`);
const descriptors = [
  ...new Set(
    [sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient].flatMap((tier) =>
      Object.values(tier),
    ),
  ),
];

const twitch = new Twitch();
for (const held of new Set(descriptors.map((descriptor) => descriptor.twitch).filter(Boolean))) {
  twitch.graft(held);
}

const held = await provider(
  { mountpoint: new Path(mountpoint), statics: { db: { file } }, version: paladin.version },
  { twitch, entities: descriptors.map((descriptor) => descriptor.schema) },
);

console.log("version", paladin.version);
console.log("migrated", JSON.stringify(held.migrated));
console.log("checkSchema", await held.orm.migrator.checkSchema());
console.log("residue", JSON.stringify(await held.orm.schema.getUpdateSchemaSQL({ wrap: false })));
await held.orm.close(true);
