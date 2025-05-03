import annotations from "./annotations/index.js";
import constraints from "./constraints/index.js";
import remedies from "./remedies/index.ts";
import extractors from "./extractors/index.js";

// const extractors = {};
const topology = "ud";
[annotations, remedies, constraints].flat().forEach((entity) => {
  entity.topology = topology;
  return entity;
});

export default { extractors, annotations, remedies, constraints };
