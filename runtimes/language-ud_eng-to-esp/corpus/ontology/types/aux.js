import annotations from "../annotations";
import unit from "../unit";

import * as verb from "./verb";

export const schema = {
  ...verb.schema,
  properties: {
    ...verb.schema.properties,
    annotation: {
      ...verb.schema.properties.annotation,
      properties: {
        ...verb.schema.properties.annotation.properties,
        pos: {
          ...annotations.pos,
          $id: "aux.annotation.pos",
          enum: ["aux"],
        },
      },
    },
  },
};

export const constraints = [...verb.constraints];

// export const annotationSpace = [
//     [
//         ["lemma", ["haber", "ser", "estar"]],
//         ["pos", ["aux"]],
//         ["verbform", ["fin"]],
//         ["mood", ["ind", "sub", "imp", "cnd"]],
//         ["tense", ["pres", "past", "fut", "imp"]],
//         ["number", ["sing", "plur"]],
//         ["person", ["1", "2", "3"]]
//     ],
//     [
//         ["lemma", ["haber", "ser", "estar"]],
//         ["pos", ["aux"]],
//         ["verbform", ["inf", "ger", "part"]]
//     ]
// ];

// export const lemmas = [];
// for (const [branch, leaves] of annotationSpace.flat()) {
//     if (branch !== "lemma") continue;
//     lemmas.push(...leaves);
// }
