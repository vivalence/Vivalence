import fs from "fs";
import supabase from "../clients/supabase.js";
import { fetchData } from "../clients/pg.js";
import parseFeats from "/Users/finn/vivalence/code/app/packages/client/src/routes/api/nlp/feats.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scope() {
  const START = 000;
  const TAKE = 500;
  const BATCHSIZE = 1000;
  const BATCHINTERVAL = 1000;
  let index = START;

  const response = await supabase
    .from("Unit")
    .select("*")
    .order("createdAt", { ascending: true })
    .range(START, TAKE);
  const units = response.data;

  const promises = [];

  for (const unit of units) {
    promises.push(
      (async (unit, index) => {
        try {
          unit.data.ud.feats = parseFeats(unit.data.ud.udFeats);
          await supabase
            .from("Unit")
            .update({
              data: unit.data,
            })
            .eq("id", unit.id);
        } catch (error) {
          if (error.code === "P2002") {
          } else {
            console.log("ERROR", error);
          }
        }
      })(unit, index),
    );
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      console.log(
        `batch launched ${index / BATCHSIZE} / ${units.length / BATCHSIZE}`,
      );
      await sleep(BATCHINTERVAL);
    }
  }
  await Promise.all(promises);
}
await scope();

// const VALUE_MAPPINGS = {
//   Number: {
//     Sing: "Singular",
//     Plur: "Plural",
//     Dual: "Dual",
//   },
//   Person: {
//     1: "First",
//     2: "Second",
//     3: "Third",
//   },
//   Tense: {
//     Past: "Past",
//     Pres: "Present",
//     Fut: "Future",
//     Imp: "Imperfect",
//     Pqp: "Preterite Perfect",
//   },
//   Mood: {
//     Ind: "Indicative",
//     Sub: "Subjunctive",
//     Imp: "Imperative",
//     Part: "Participle",
//     Inf: "Infinitive",
//     Ger: "Gerund",
//     Cnd: "Conditional",
//   },
//   VerbForm: {
//     Fin: "Finite",
//     Inf: "Infinitive",
//     Part: "Participle",
//     Ger: "Gerund",
//     Sup: "Supine",
//   },
//   Gender: {
//     Masc: "Masculine",
//     Fem: "Feminine",
//     Neut: "Neuter",
//   },
//   Voice: {
//     Act: "Active",
//     Pass: "Passive",
//     Mid: "Middle",
//   },
//   Case: {
//     Nom: "Nominative",
//     Acc: "Accusative",
//     Dat: "Dative",
//     Gen: "Genitive",
//     Voc: "Vocative",
//     Loc: "Locative",
//     Ins: "Instrumental",
//     Abl: "Ablative",
//   },
//   Degree: {
//     Pos: "Positive",
//     Comp: "Comparative",
//     Sup: "Superlative",
//   },
//   Aspect: {
//     Impf: "Imperfective",
//     Perf: "Perfective",
//     Prog: "Progressive",
//   },
//   Polarity: {
//     Pos: "Positive",
//     Neg: "Negative",
//   },
//   Possessive: {
//     Yes: "Yes",
//     No: "No",
//   },
//   Reflex: {
//     Yes: "Yes",
//     No: "No",
//   },
//   Definite: {
//     Ind: "Indefinite",
//     Def: "Definite",
//     Com: "Complex",
//   },
//   Evident: {
//     Fh: "Direct",
//     Nfh: "Non-direct",
//   },
//   PronType: {
//     Prs: "Personal",
//     Dem: "Demonstrative",
//     Int: "Interrogative",
//     Rel: "Relative",
//     Exc: "Exclusive",
//     Incl: "Inclusive",
//     Art: "Article",
//   },
//   Foreign: {
//     Yes: "Yes",
//     No: "No",
//   },
//   Typo: {
//     Yes: "Yes",
//     No: "No",
//   },
//   PrepCase: {
//     Npr: "Non-Prepositional",
//     Pre: "Prepositional",
//   },
//   NumType: {
//     Card: "Cardinal",
//     Ord: "Ordinal",
//     Mult: "Multiplicative",
//     Frac: "Fraction",
//   },
//   AdvType: {
//     Man: "Manner",
//     Loc: "Locative",
//     Tim: "Temporal",
//     Cau: "Causal",
//     Deg: "Degree",
//   },
// };

// const invertNestedObject = (obj) => {
//   const inverted = {};
//   for (const [key, value] of Object.entries(obj)) {
//     inverted[key] = {};
//     for (const [innerKey, innerValue] of Object.entries(value)) {
//       inverted[key][innerValue] = innerKey;
//     }
//   }
//   return inverted;
// };

// const invertedValueMappings = invertNestedObject(VALUE_MAPPINGS);
// console.log("invertedValueMappings");
// console.log(invertedValueMappings);
