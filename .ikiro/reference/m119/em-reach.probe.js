import { RequestContext } from "@mikro-orm/core";
import { EntitySchema, MikroORM } from "@mikro-orm/sqlite";
import { Datamap } from "@vivalence/typology";

const Probe = new EntitySchema({
  name: "Probe",
  properties: { id: { type: "number", primary: true }, slug: { type: "string" } },
  filters: { daemon: { cond: (args) => (args?.daemon ? { slug: args.daemon } : {}), default: true, args: false } },
});
const orm = await MikroORM.init({ dbName: ":memory:", entities: [Probe], allowGlobalContext: true });
const datamap = new Datamap(orm);
const em = datamap.entities.em;

const viaShard = await datamap.shard.scope(async () => {
  RequestContext.getEntityManager(em.name).setFilterParams("daemon", { daemon: "memo" });
  return RequestContext.getEntityManager(em.name).getFilterParams("daemon");
});
const viaEm = await RequestContext.create(em, async () => {
  RequestContext.getEntityManager(em.name).setFilterParams("daemon", { daemon: "memo" });
  return RequestContext.getEntityManager(em.name).getFilterParams("daemon");
});

console.log(JSON.stringify({
  "entities.em is orm.em": em === orm.em,
  "em.getMetadata() is datamap.getMetadata()": em.getMetadata() === datamap.getMetadata(),
  "params via datamap.shard.scope": viaShard,
  "params via RequestContext.create(entities.em)": viaEm,
}, null, 2));
await orm.close();
