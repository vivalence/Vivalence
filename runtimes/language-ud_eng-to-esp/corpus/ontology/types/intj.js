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
          $id: "intj.annotation.pos",
          enum: ["intj"],
        },
        lemma: { ...annotations.lemma },
      },
      required: ["pos", "lemma"],
    },
  },
};

export const constraints = [
  { unique: { branch: "pos" } },
  { required: { branch: "pos", leaf: "intj" } },
];

export const annotationSpace = [
  [
    ["pos", ["intj"]],
    [
      "lemma",
      [
        "ah",
        "oh",
        "eh",
        "uy",
        "ay",
        "sí",
        "vaya",
        "caramba",
        "hola",
        "adiós",
        "claro",
        "genial",
        "estupendo",
        "bravo",
      ],
    ],
  ],
];

export const lemmas = [];
for (const [branch, leaves] of annotationSpace.flat()) {
  if (branch !== "lemma") continue;
  lemmas.push(...leaves);
}
