import { Path, Twitch } from "@vivalence/typology";
import { sets } from "@vivalence/typology/entities";
import { assemble } from "./gestalten/belt/index.js";
import { provider } from "../../commons/datamaps/libsql/libsql.viva.js";

const [mount, version] = Deno.args;
const { entities, twitch } = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
const root = new Twitch();
for (const held of twitch) root.graft(held);
const datamap = await provider(
  { mountpoint: new Path(mount), statics: { db: { file: "localhost.viva.db" }, context: { name: "runtime/probe" } }, version },
  { twitch: root, entities: entities.map((descriptor) => descriptor.schema) },
);
console.log("migrated", JSON.stringify(datamap.migrated));
Deno.exit(0);
