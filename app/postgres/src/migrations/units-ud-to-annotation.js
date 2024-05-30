import fs from "fs";
import supabase from "../clients/supabase.js";
import { fetchData } from "../clients/pg.js";
import annotate from "/Users/finn/vivalence/code/app/packages/client/src/routes/api/classifier/parse/annotate.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const exampledata = {
  ud: {
    text: "y",
    upos: "CCONJ",
    xpos: "cc",
    feats: {},
    lemma: "y",
  },
  pos: ["CONJUNCTION_COORDINATING", "CONJUNCTION_SUBORDINATING"],
  type: "CONJ",
  lemmaEnglish: null,
  lemmaSpanish: "y",
  index: 4,
  english: "and",
  spanish: "y",
  usageInEnglish: "they know how to read and write",
  usageInSpanish: "saben leer y escribir",
};

const referenceDate = new Date("2024-05-12T00:00:00.000Z");
async function scope() {
  const START = 0;
  const TAKE = 50000;
  const BATCHSIZE = 1000;
  const BATCHINTERVAL = 1000;
  let index = START;

  const response = await supabase
    .from("Unit")
    .select("*")
    // .lte("updatedAt", referenceDate.toISOString())
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE);

  if (response.error) return console.error(response.error);

  console.log("ops avail", response.data.length);
  const units = response.data.filter((unit) => !unit.data.annotation.lemma);
  console.log("ops to do", units.length);

  async function update(unit, index) {
    try {
      const token = { ...unit.data.ud };
      token.feats = unit.data.udFeats || token.feats["_"] || "";
      token.lemma = unit.lemmaSpanish || token.lemma || unit.data.spanish;
      token.token = unit.data.spanish || token.text;

      const annotation = annotate(token);
      delete unit.data.ud;
      delete unit.data.pos;
      delete unit.data.type;
      delete unit.data.lemmaSpanish;
      delete unit.data.lemmaEnglish;
      delete unit.data.corpusVerbId;
      delete unit.data.performer;
      delete unit.data.tense;
      delete unit.data.ending;
      delete unit.data.mood;
      unit.data.annotation = annotation;

      await supabase
        .from("Unit")
        .update({
          updatedAt: new Date(),
          data: unit.data,
        })
        .eq("id", unit.id);
    } catch (error) {
      if (error.code === "P2002") {
      } else {
        console.log("ERROR", error);
      }
    }
  }

  const promises = [];
  for (const unit of units) {
    promises.push(update(unit, index));
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      await Promise.all(promises);
      console.log(`batch: ${index / BATCHSIZE} / ${units.length / BATCHSIZE}`);
    }
  }
  console.log("total ops:", promises.length);
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
