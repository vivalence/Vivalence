import entities from "./entities.js";
import topology from "./topology.js";

export default (ontology) => {
  return [entities, topology].reduce((ontology, apply) => apply(ontology), ontology);
};
