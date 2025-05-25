import dimensions from "./dimensions/index.js";
import constraints from "./constraints/index.js";
import remedies from "./remedies/index.ts";
import extractors from "./extractors/index.js";

const topology = "ud";
[dimensions, remedies, constraints].flat().forEach((entity) => {
  entity.topology = topology;
  return entity;
});

export default { extractors, dimensions, remedies, constraints };
