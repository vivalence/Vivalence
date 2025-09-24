import noun from "./noun.js";

const propn = { ...noun, slug: "propn", name: "Proppernoun", description: "names n shit" };

propn.relations = propn.relations.map((relation) => {
  if (relation.required?.branch === "pos" && relation.required?.leaf === "noun") {
    relation.required.leaf = "propn";
  }
  return relation;
});

export default propn;
