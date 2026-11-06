import { datamap } from "@vivalence/runtime/scenarios";
import { SymbolEntity } from "@vivalence/runtime";
import { RequestContext, wrap } from "@mikro-orm/core";

const scenario = await datamap.seed();
const { repos, em, fixtures } = scenario;
const chess = repos.mode.create({ slug: "chess", type: "domain", daemon: fixtures.daemon, traits: [], installed: "" });
await em.flush();
em.clear();

const lookup = (params) =>
  scenario.datamap.shard.scope(async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    for (const [name, value] of Object.entries(params)) ctx.setFilterParams(name, value);
    const symbol = await ctx.findOne(SymbolEntity, { slug: "greeting" });
    return symbol && wrap(symbol).toPOJO();
  });

console.log("the beat's params: daemon + mode chess");
console.log(JSON.stringify(await lookup({ daemon: { daemon: fixtures.daemon.slug }, mode: { mode: chess.id } }), null, 2));
console.log("the installer's params: daemon + mode null");
console.log(JSON.stringify(await lookup({ daemon: { daemon: fixtures.daemon.slug }, mode: { mode: null } }), null, 2));
await scenario.orm.close();
