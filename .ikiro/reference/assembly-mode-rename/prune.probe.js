// limit: 4000 chars
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { sets } from "@vivalence/runtime";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { mint, presets, strike } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/traits.js";
import { prune } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/modes.js";

const copy = Deno.args[0];
const DAEMON = "droneaid";

const recipe = [
  "domain/assembly",
  "topology/part",
  "topology/placement",
  "topology/step",
  "topology/guide",
  "topography/models",
  "topography/guides",
  "model/import",
  "model/editor",
  "guide/editor",
  "guide/player",
  "dashboard/dataspace",
];

const stack = [sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient];
const orm = await MikroORM.init({
  ...config({}, { entities: assemble(stack).entities.map((d) => d.schema) }),
  dbName: copy,
  allowGlobalContext: true,
});

const sql = (q) => orm.em.getConnection().execute(q);
const census = async (label) => {
  console.log(`--- ${label}`);
  console.log(JSON.stringify(await sql(`select type, slug from Mode where daemon_slug = '${DAEMON}' order by type, slug`), null, 2));
  console.log(JSON.stringify(await sql(`select id, mode from Buffer where id = '01a1cf81-8fc9-758c-9937-d641cf1b42ed'`), null, 2));
};

await census("before");

const entities = strike(mint({ slug: DAEMON, kinds: sets.traits, traits: presets }), orm.em, sets.traits);
const modes = {};
await RequestContext.create(orm.em, async () => {
  for (const identifier of recipe) {
    const [type, slug] = identifier.split("/");
    const entity = await entities.mode.ensure({ type, slug, name: slug, version: "0.0.0", traits: [], daemon: DAEMON });
    await orm.em.flush();
    (modes[type] ??= {})[slug] = { manifest: { type, slug }, module: {}, entity: { id: entity.id } };
  }
});

const context = {
  modes,
  entities: { ...entities, intent: { find: async () => [] }, em: orm.em },
  datamap: { shard: { scope: (fn) => RequestContext.create(orm.em, fn) } },
};
await prune(context, DAEMON);

await census("after");
await orm.close();
