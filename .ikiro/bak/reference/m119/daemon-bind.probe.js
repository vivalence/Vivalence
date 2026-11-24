import { MikroORM } from "@mikro-orm/core";
import { Aperture, Datamap, shape, shard } from "@vivalence/typology";
import { sets, DaemonEntity, LiteralEntity, ModeEntity, UserEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const ROW = (name) => ({ cond: (args) => (args?.[name] ? { [name]: args[name] } : {}), default: true, args: false });
const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
for (const type of ["literal", "symbol", "note", "mode"]) assembled.entities.find((d) => d.type === type).schema.meta.filters.daemon = ROW("daemon");

const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
await orm.schema.create();
const datamap = new Datamap(orm);
const em = datamap.entities.em;

await datamap.shard.scope(async () => {
  em.setFilterParams("user", { user: null });
  em.create(UserEntity, { slug: "beef" });
  const italian = em.create(DaemonEntity, { slug: "italian" });
  const spanish = em.create(DaemonEntity, { slug: "spanish" });
  await em.flush();
  const casaIt = em.create(ModeEntity, { slug: "casa", type: "language", daemon: italian });
  const casaEs = em.create(ModeEntity, { slug: "casa", type: "language", daemon: spanish });
  await em.flush();
  em.create(LiteralEntity, { slug: "casa", daemon: italian, mode: casaIt, literal: "casa", mime: "text/plain", traits: [], trait: {} });
  em.create(LiteralEntity, { slug: "cane", daemon: italian, mode: casaIt, literal: "cane", mime: "text/plain", traits: [], trait: {} });
  em.create(LiteralEntity, { slug: "casa", daemon: spanish, mode: casaEs, literal: "casa", mime: "text/plain", traits: [], trait: {} });
  await em.flush();
});

const host = (slug) => {
  const aperture = new Aperture().use(shard.datamap.inject(datamap));
  if (slug) aperture.use(datamap.shard.bind("daemon", () => ({ daemon: slug })));
  aperture.use(async (ctx, next) => { em.setFilterParams("user", { user: null }); await next(); });
  for (const kind of ["literal", "mode"]) aperture.branch(`/entities/${kind}`).graft(shard.datamap.repository(datamap.entities[kind]));
  return shape.http(aperture);
};
const serve = { italian: host("italian"), spanish: host("spanish"), runtime: host(null) };

const post = async (who, path, body = {}) => {
  const response = await serve[who](new Request(`http://probe${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  return response.json();
};
const tag = (rows) => rows.map((row) => `${row.slug}:${row.daemon}`);

console.log("italian  /entities/literal/find {}        ", JSON.stringify(tag(await post("italian", "/entities/literal/find"))));
console.log("spanish  /entities/literal/find {}        ", JSON.stringify(tag(await post("spanish", "/entities/literal/find"))));
console.log("italian  /entities/literal/find {daemon:spanish}", JSON.stringify(await post("italian", "/entities/literal/find", { where: { daemon: "spanish" } })));
console.log("italian  /entities/literal/count {}       ", JSON.stringify(await post("italian", "/entities/literal/count")));
console.log("italian  /entities/mode/findOne {slug:casa}", JSON.stringify((await post("italian", "/entities/mode/findOne", { where: { slug: "casa" } })).daemon));
console.log("runtime  /entities/literal/find {} no bind", JSON.stringify(tag(await post("runtime", "/entities/literal/find"))));
await orm.close();
