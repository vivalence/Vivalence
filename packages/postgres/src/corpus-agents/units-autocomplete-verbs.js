import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";
import {
  pos as POS,
  annotations,
} from "/Users/finn/vivalence/code/app/packages/client/src/routes/api/classifier/ontology";

const topSpanishVerbs = (() => {
  return [
    "ser",
    "estar",
    "tener",
    "hacer",
    "poder",
    "decir",
    "ir",
    "ver",
    "dar",
    "saber",
    "querer",
    "llegar",
    "pasar",
    "deber",
    "poner",
    "parecer",
    "quedar",
    "creer",
    "hablar",
    "llevar",
  ];
})();

async function getVerbs(lemmas) {
  const branch = "pos";
  const leafs = ["verb", "aux"];

  const units = [];
  const unitsCachePath = "./src/corpus-agents/units.json";

  if (fs.existsSync(unitsCachePath)) {
    return JSON.parse(fs.readFileSync(unitsCachePath));
  }

  for (const leaf of leafs) {
    const { data: tag, error } = await supabase
      .from("Tag")
      .select(`*, _TagToUnit(*, Unit: B (*))`)
      .eq(`data->ONTOLOGICAL->>branch`, branch)
      .eq(`data->ONTOLOGICAL->>leaf`, leaf)
      .single();

    tag._TagToUnit
      .map((r) => r.Unit)
      .sort((a, b) => a.createdAt - b.createdAt)
      .filter((unit) => lemmas.includes(unit.data.annotation.lemma))
      .forEach((unit) => {
        units.push(unit);
      });
  }

  fs.writeFileSync(unitsCachePath, JSON.stringify(units, null, 2));
  return units;
}
const verbs = await getVerbs(topSpanishVerbs);

async function getLemmas() {
  return Object.entries(
    verbs.reduce((acc, unit) => {
      if (!unit.data.annotation) console.log("missing annotation", unit);
      if (!acc[unit.data.annotation.lemma]) {
        acc[unit.data.annotation.lemma] = [];
      }
      acc[unit.data.annotation.lemma].push(unit);
      return acc;
    }, {}),
  )
    .filter(([lemma, units]) => topSpanishVerbs.includes(lemma))
    .sort((a, b) => b[1].length - a[1].length);
}
const lemmas = await getLemmas();

async function remedyRequiredLemmaTags(lemmas) {
  const { data: doneTags } = await supabase
    .from("Tag")
    .select("id, data")
    .eq("data->ONTOLOGICAL->>branch", "lemma");
  const done = doneTags.map((tag) => tag.data.ONTOLOGICAL.leaf);

  for (const lemma of lemmas) {
    if (done.includes(lemma)) continue;

    console.log("create lemma tag", lemma);

    const { data: lemmaTag, error } = await supabase
      .from("Tag")
      .insert({
        name: `Verb Lemma: ${lemma}`,
        type: ["ONTOLOGICAL", "LEARNABLE", "COMPLETABLE"],
        data: {
          LEARNABLE: {},
          COMPLETABLE: {},
          ONTOLOGICAL: {
            branch: "lemma",
            leaf: lemma,
          },
        },
      })
      .select("*")
      .single();
    if (error) {
      console.log("error", error);
      throw new Error("error");
    }
  }
}
// await remedyRequiredLemmaTags(topSpanishVerbs);

async function predictSpace() {
  const space = [
    ["pos", ["verb"]],
    ["mood", ["ind"]],
    ["lemma", ["ser", "estar", "tener", "hacer", "poder", "decir"]],
    ["verbform", ["fin"]],
    ["tense", ["pres"]], //, "past", "fut", "imp"]],
    ["number", ["sing", "plur"]],
    ["person", ["1", "2", "3"]],
  ];

  const { data: prediction } = await post(
    "/api/classifier/validate/ontology/units/predict",
    { space },
  );

  console.log("prediction issues", prediction.issues);

  return;
  for (const [i, issue] of prediction.issues.entries()) {
    const { data: remedy, error } = await post("/api/classifier/remedy", {
      issue,
    });
    console.log("remedy", i, issue.violation, remedy.resolved);
  }
}
await predictSpace();

// handled elsewhere
async function remedyUnitLemmaConnections(lemmas) {
  for (const [lemma, units] of lemmas) {
    const { data: lemmaTag, error } = await supabase
      .from("Tag")
      .select("id")
      .eq("data->ONTOLOGICAL->>branch", "lemma")
      .eq("data->ONTOLOGICAL->>leaf", lemma)
      .single();

    for (const unit of units) {
      const result = await supabase
        .from("_TagToUnit")
        .upsert({ A: lemmaTag.id, B: unit.id });
    }
  }
}
// await remedyUnitLemmaConnections(lemmas);
