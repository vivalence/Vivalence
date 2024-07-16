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
          $id: "cconj.annotation.pos",
          enum: ["cconj"],
        },
        lemma: { ...annotations.lemma },
      },
      required: ["pos", "lemma"],
    },
  },
};

export const constraints = [
  { unique: { branch: "pos" } },
  { required: { branch: "pos", leaf: "cconj" } },
];

export const annotationSpace = [
  [
    ["pos", ["cconj"]],
    ["lemma", ["y", "o", "pero", "sino", "ni"]],
  ],
];

export const lemmas = [];
for (const [branch, leaves] of annotationSpace.flat()) {
  if (branch !== "lemma") continue;
  lemmas.push(...leaves);
}
