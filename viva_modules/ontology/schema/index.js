import annotations from "./annotations.js";
import unit from "./unit.js";

export default (schema) => {
  return [annotations, unit].reduce((schema, type) => type(schema), schema);
};
