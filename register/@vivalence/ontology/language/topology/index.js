import dimensions from "./dimensions/index.js";
import remedies from "./remedies/index.ts";
import extractors from "./extractors/index.js";

const topology = "language";
[dimensions, remedies].flat().forEach((entity) => {
  entity.topology = topology;
  return entity;
});

export default { extractors, dimensions, remedies };
