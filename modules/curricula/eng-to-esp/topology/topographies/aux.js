import verb from "./verb.js";

const aux = {
  ...verb,
  slug: "aux",
  name: "aux verb",
  description: " i dont have the system yet so get off my back. ",
};

aux.relations = aux.relations.map((relation) => {
  if (relation.required?.branch === "pos" && relation.required?.leaf === "verb") {
    relation.required.leaf = "aux";
  }
  return relation;
});

export default aux;
