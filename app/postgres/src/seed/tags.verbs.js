import fs from "fs";
// import { PrismaClient } from "@prisma/client";
// import nlp from "../../../../src/services/nlp/index.js";
import supabase from "../../src/clients/supabase.js";
// import { fetchData } from "../../../../src/clients/pg.js";

// Haber (to have)
// Tener (to have)
// Hacer (to do, to make)
// Ir (to go)
// Poder (can, to be able to)

// Decir (to say, to tell)
// Ver (to see)
// Dar (to give)
// Saber (to know)
// Querer (to want, to love)

const word = "haber";
const verbTagId = "05a4c4ab-2c70-4e72-b5ca-cdb19a9b36d2"; // haber
const tenseTagId = "clrzb19mp0079g0m3badzek07"; // Present

// const { error, data: words } = await supabase
//   .from("Unit")
//   .select("*")
//   .eq("data->ud->>upos", "VERB")
//   .in("data->>tense", ["PRESENTE", "PRETERITO", "FUTURO", "IMPERFECTO"])
//   .in("data->ud->feats->>Tense", ["Present", "Past", "Future", "Imperfect"])
//   .eq("data->ud->>lemma", word);
// console.log(words.length);
// for (const [i, unit] of words.entries()) {
//   const result = await supabase
//     .from("_TagToUnit")
//     .upsert({ A: tagId, B: unit.id }, { ignoreDuplicates: false });
//   console.log(i, result);
// }
// tag._TagToUnit.map(({ Unit }) => {
//   if (Unit.data.ud.feats.Tense == "Present") {
//     console.log(Unit);
//   }
// });

// console.log(tenses, tag._TagToUnit.length);
const { data: verbTag } = await supabase
  .from("Tag")
  .select("*, _TagToUnit(*, Unit: B (*))")
  .eq("id", verbTagId)
  .single();

const { data: tenseTag } = await supabase
  .from("Tag")
  .select("*, _TagToUnit(*, Unit: B (*))")
  .eq("id", tenseTagId)
  .single();

// const tenses = {undefined: 0, Present: 0, Future: 0, Imperfect: 0, Past: 0,};
// {undefined: 3, Present: 13, Future: 3, Imperfect: 5, Past: 3,} 27

// i query two tags
// a tense and a verb
// i create a array Unit[]
// then i itterate over the units in tense, looking for a units relationship with the verb,. and throw all of them into the array
const units = [];

// for each unit in tense
// go through each unit in verb
// if the unit in verb is in tense
// add it to the array
for (const { Unit } of tenseTag._TagToUnit) {
  for (const { Unit: verbUnit } of verbTag._TagToUnit) {
    if (Unit.id === verbUnit.id) {
      units.push(Unit);
    }
  }
}

console.log(JSON.stringify(units, null, 2));
