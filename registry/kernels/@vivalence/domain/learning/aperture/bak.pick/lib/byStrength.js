import { is } from "@vivalence/typology";
import shared from "./shared.js";

export default (resourceType) => async (body, ctx) => {
  let resources = await shared(resourceType)(body, ctx);

  const take = body.take || (body.batch || 0) + (body.stock || 0);
  if (is.numberPositive(take)) resources = resources.slice(0, take);

  return resources;
};
