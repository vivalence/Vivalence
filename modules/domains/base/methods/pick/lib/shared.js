import get from "./get.js";
import sort from "./sort.js";

export default (resourceType) => async (body, ctx) => {
  const { blacklist, take } = body;
  let resources = body[resourceType];

  if (!resources) {
    const params = { blacklist };

    if (body.tagIds) {
      params.tagIds = body.tagIds;
      resources = await ctx.runtime.call(`/${resourceType}/fromTagIds`, params);
    }
    if (body.unitIds) {
      params.unitIds = body.unitIds;
      resources = await ctx.runtime.call(`/${resourceType}/fromUnitIds`, params);
    }
  }

  if (blacklist?.[resourceType]?.length > 0)
    resources = resources.filter((r) => !blacklist[resourceType].includes(r.id));

  resources = await Promise.all(resources.map((r) => get[resourceType](r, ctx)));

  resources = await sort(resources);

  return resources;
};
