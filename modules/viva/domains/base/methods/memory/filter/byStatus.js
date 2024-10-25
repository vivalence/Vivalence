import filter from "../lib/filter.js";
import shared from "./shared.js";

export default (resourceType) => async (body, ctx) => {
  let resources = await shared(resourceType)(body, ctx);

  resources = resources.filter((r) => filter.byStatus(r, body.status));
  if (body.take) resources = resources.slice(0, body.take);

  return resources;
};
