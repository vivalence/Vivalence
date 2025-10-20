import { RouteContext } from "@vivalence/types";
// import { strings, array } from "@vivalence/shared";
// import { wrap } from "@mikro-orm/core";
// import config from "@vivalence/paladin";
// import { enums, TagEntity } from "@vivalence/schema";

const resourceTypeMap = { units: "unit", tags: "tag", dependencies: "dependency" };

export default async function (corpus: any, ctx: RouteContext) {
  // TODO: might want to enforce tags->units->dependencies order.
  const promises = [];
  for (const [key, resources] of Object.entries(corpus)) {
    resources
      .map((resource) => ({ [resourceTypeMap[key]]: resource }))
      .map((resource) => () => ctx.runtime.call(`/${resourceTypeMap[key]}/install`, resource))
      .forEach((promise) => promises.push(promise));
  }

  let i = 0;
  const installations = [];

  // CHUNKED INSTALLATION
  // TODO: requires entitymap management bc of parallel entity construction and patching.
  // if (promises.length > config.env.get("INSTALL_CHUNKING_THRESHOLD")) {for (const chunk of array.chunk(promises, config.env.get("INSTALL_CHUNK_SIZE"))) {await Promise.all(chunk.map(async (p) => installations.push(await p()))); console.log("curriculum (chunked) install:", i++);}} else {

  // LINEAR INSTALLATION
  for (const promise of promises) {
    const result = await promise();
    installations.push(result);
    i++;
    console.log("corpus (linear) install:", i, result.status, result.operation);
  }

  await ctx.runtime.entities.em.flush();
  return installations;
}
