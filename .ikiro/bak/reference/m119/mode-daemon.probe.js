import { Mode } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";
import { RequestContext, wrap } from "@mikro-orm/core";

const scenario = await datamap.seed();
const { repos, em, fixtures } = scenario;
const masks = [
  { module: "@chess/domain/chess", daemon: fixtures.daemon.slug, manifest: { type: "domain", slug: "chess", traits: ["APPLICATION"] } },
  { module: "@commons/harness/runtime", daemon: null, manifest: { type: "harness", slug: "runtime", traits: [] } },
];

for (const mode of masks.map((mask) => new Mode(mask))) await scenario.datamap.shard.scope(async () => {
  const ctx = RequestContext.getEntityManager(em.name);
  ctx.setFilterParams("daemon", { daemon: mode.daemon });
  const entity = await ctx.getRepository(repos.mode.entityName ?? "ModeEntity").ensure({ ...mode.manifest, daemon: mode.daemon });
  entity.traits = [...mode.manifest.traits];
  await ctx.flush();
  mode.entity = wrap(entity).toPOJO();
  mode.id = mode.entity.id;
  console.log("filter params · daemon");
  console.log(JSON.stringify(ctx.getFilterParams("daemon"), null, 2));
  console.log("die.mode.entity");
  console.log(JSON.stringify(mode.entity, null, 2));
});
await scenario.orm.close();
