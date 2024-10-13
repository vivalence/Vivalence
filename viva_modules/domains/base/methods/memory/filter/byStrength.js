import shared from "./shared.js";

export default (resourceType) => async (body, ctx) => {
  let resources = await shared(resourceType)(body, ctx);
  if (body.take) resources = resources.slice(0, body.take);
  return resources;
};
