import annotations from "./annotations/index.js";
import constraints from "./constraints/index.js";
import remedies from "./remedies/index.ts";

const topology = "ud";
[annotations, remedies, constraints].flat().forEach((entity) => {
  entity.topology = topology;
  return entity;
});

export default { annotations, remedies, constraints };
