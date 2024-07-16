import annotations from "../annotations";
import unit from "../unit";

export const schema = {
  ...unit,
  properties: {
    ...unit.properties,
    annotation: {
      type: "object",
      properties: {
        pos: {
          ...annotations.pos,
          $id: "adj.annotation.pos",
          enum: ["adj"],
        },
        lemma: { ...annotations.lemma },
        gender: { ...annotations.gender },
        number: { ...annotations.number },
        degree: { ...annotations.degree },
      },
      required: ["pos", "lemma", "gender", "number"],
    },
  },
};

export const constraints = [
  { unique: { branch: "pos" } },
  { required: { branch: "pos", leaf: "adj" } },
  { required: { branch: "gender", leaf: "masc" } },
  { required: { branch: "gender", leaf: "fem" } },
  { required: { branch: "number", leaf: "sing" } },
  { required: { branch: "number", leaf: "plur" } },
  { unique: { branch: "degree" } },
];
// export const lemmas = [];
// for (const [branch, leaves] of annotationSpace.flat()) {
//     if (branch !== "lemma") continue;
//     lemmas.push(...leaves);
// }
