import { MikroORM } from "@mikro-orm/core";
import { Datamap } from "@vivalence/typology";
import { sets, DaemonEntity, LiteralEntity, ModeEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
assembled.entities.find((d) => d.type === "literal").schema.meta.filters.mode = { cond: (args) => (args?.mode ? { mode: args.mode } : {}), default: true, args: false };
const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
await orm.schema.create();
const datamap = new Datamap(orm);
const em = datamap.entities.em;

let seeded;
await datamap.shard.scope(async () => {
  em.setFilterParams("user", { user: null });
  const daemon = em.create(DaemonEntity, { slug: "edu" });
  const italian = em.create(ModeEntity, { slug: "italian", type: "language", daemon });
  const chess = em.create(ModeEntity, { slug: "chess", type: "game", daemon });
  await em.flush();
  for (const [mode, slug] of [[italian, "ciao"], [italian, "grazie"], [chess, "e4"]]) {
    em.create(LiteralEntity, { slug, daemon, mode, literal: slug, mime: "text/plain", traits: [], trait: {} });
  }
  await em.flush();
  seeded = { italian: italian.id, chess: chess.id };
});

const slugs = (rows) => rows.map((l) => l.slug);
const probe = async (name, fn) => {
  try { console.log(name, JSON.stringify(await fn())); } catch (error) { console.log(name, "THREW", JSON.stringify(error.message)); }
};
await probe("scope, no params → reads all             ", () => datamap.shard.scope(() => datamap.entities.literal.find({}).then(slugs)));
await probe("scope, shard.bind(\"mode\") AS IS → fenced ", () =>
  datamap.shard.scope(async () => {
    const out = [];
    await datamap.shard.bind("mode", (ctx) => ({ mode: ctx.mode.id }))({ mode: { id: seeded.chess } }, async () => out.push(...slugs(await datamap.entities.literal.find({}))));
    return out;
  }));
await probe("scope, setFilterParams inside a beat      ", () =>
  datamap.shard.scope(async () => { em.setFilterParams("mode", { mode: seeded.italian }); return slugs(await datamap.entities.literal.find({})); }));
await probe("fork taken inside carries the params     ", () =>
  datamap.shard.scope(async () => { em.setFilterParams("mode", { mode: seeded.italian }); return slugs(await em.fork().find(LiteralEntity, {})); }));
await probe("a fresh scope after → reads all          ", () => datamap.shard.scope(() => datamap.entities.literal.count()));
await orm.close();
