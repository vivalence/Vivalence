import { RuleEntity } from "@vivalence/schema";
import adj from "./units/adj.js";
// import adp from "./units/adp.js";
// import adv from "./units/adv.js";
// import cconj from "./units/cconj.js";
// import det from "./units/det.js";
// import intj from "./units/intj.js";
// import noun from "./units/noun.js";
// import num from "./units/num.js";
// import pron from "./units/pron.js";
// import sconj from "./units/sconj.js";
// import punct from "./units/punct.js";
// import verb from "./units/verb.js";

// export default {topographies:[], rules:[], annotations:[],remedies:[], classifier:{}}

export default (ontology) => {
  // pull ontology schema etc.
  // create

  // return ontology
  // const unitschema = ontology.schema.get(["unit"]);
  // console.log("unitschema", ontology.schema.get(["pos", "pos"]));
  // console.log("unitschema", ontology.schema.get(["pos"]));

  new RuleEntity({
    path: ["unit", "adjective"],
    traits: ["SCHEMATIC"],
    data: {
      SCHEMATIC: {
        json: {
          // ...unitschema,
          title: "Adjective",
          description:
            "An adjective is a word that describes a noun or pronoun. It tells us what the thing being described is like by giving us more information about the object. Adjectives can be used to describe physical appearance, personality, color, size, shape, age, and more.",
          properties: {
            // ...unitschema.properties,
            annotation: {
              // ...unitschema.properties.annotation,
              properties: {
                pos: {
                  // ...ontology.schema.get(["pos", "pos"]),
                  $id: "adj.annotation.pos",
                  enum: ["adj"],
                },
                // lemma: { ...schema.annotations.lemma },
                // gender: { ...schema.annotations.gender },
                // number: { ...schema.annotations.number },
                // degree: { ...schema.annotations.degree },
              },
              required: ["pos", "lemma", "gender", "number"],
            },
          },
        },
      },
    },
  });

  // schema.units.adj = {
  //   ...schema.unit,
  // };

  // for each constraint, create RULE.
  // schema.constraints.adj = [
  //   { unique: { branch: "pos" } },
  //   { required: { branch: "pos", leaf: "adj" } },
  //   { required: { branch: "gender", leaf: "masc" } },
  //   { required: { branch: "gender", leaf: "fem" } },
  //   { required: { branch: "number", leaf: "sing" } },
  //   { required: { branch: "number", leaf: "plur" } },
  //   { unique: { branch: "degree" } },
  // ];

  return ontology;
};

// schema.units = {};
// schema.constraints = {};

// schema = [adj, adp, adv, cconj, det, intj, noun, num, pron, punct, sconj, verb].reduce(
//   (schema, type) => type(schema),
//   schema,
// );
