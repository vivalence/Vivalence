import entities from "./entities.js";
import annotations from "./annotations.js";

export default (ontology) => {
  return [entities, annotations].reduce((ontology, apply) => apply(ontology), ontology);
};
