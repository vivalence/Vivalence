import fs from "node:fs";
import supabase from "../clients/supabase.js";
import fetchData from "../clients/pg.js";

async function connectAdjectives() {
  const START = 0;
  const TAKE = 500000;
  const BATCHSIZE = 100;
  let index = START;

  // const query = ` SELECT tag.* FROM public."Tag" AS tag ORDER BY tag."createdAt"; `; const result = await fetchData(query);

  const { data: genders } = await supabase
    .from("Tag")
    .select("*")
    .eq("data->ONTOLOGICAL->>branch", "Gender");

  const { data: numbers } = await supabase
    .from("Tag")
    .select("*")
    .eq("data->ONTOLOGICAL->>branch", "Number");

  let { data: units } = await supabase
    .from("Unit")
    .select("*, _TagToUnit(*, Tag: A (* )) ")
    .eq("_TagToUnit.Tag.data->ONTOLOGICAL->>branch", "upos")
    .eq("_TagToUnit.Tag.data->ONTOLOGICAL->>leaf", "NOUN")
    .not("_TagToUnit.Tag", "is", "null")
    .order("createdAt", { ascending: true })
    .range(START, TAKE);
  // .limit(100);
  units = units.filter((unit) => unit._TagToUnit.filter((r) => !!r.Tag).length > 0);

  console.log(units.length);

  const promises = [];
  for (const tag of [...numbers]) {
    promises.push(
      (async (tag, index) => {
        try {
          const insertQuery = `
  INSERT INTO public."_TagToUnit" ("A", "B")
  VALUES 
  ${units.map((unit) => `('${tag.id}', '${unit.id}')`).join(", ")}
  ON CONFLICT ("A", "B") DO NOTHING;`;
          // console.log(insertQuery);
          // write query to file tmp.sql
          fs.writeFileSync(`tmp-${tag.name}.sql`, insertQuery);

          // const data = await supabase.from("_TagToUnit").insert(
          //   units.map(
          //     (unit) => ({
          //       A: tag.id,
          //       B: unit.id,
          //     }),
          //     {
          //       ignoreDuplicates: true,
          //       onConflict: ["A", "B"],
          //     },
          //   ),
          // );
          // // .eq("id", tag.id);
          // console.log("data", data);
        } catch (error) {
          if (error.code === "23505") {
            // console.log("DUPLICATE p2002", tag.id);
          } else {
            console.log("ERROR", error);
          }
        }
      })(tag, index)
    );

    // if (index++ % BATCHSIZE === BATCHSIZE - 1) {
    //   console.log(
    //     `batch launched ${index / BATCHSIZE} / ${units.length / BATCHSIZE}`,
    //   );
    // await sleep(BATCHINTERVAL);
    // }
  }
  await Promise.all(promises);
}

const tacticId = "e58b19ec-d7b8-4549-ae91-4d163fbfbe27";
const strategyId = "169f6e56-0f30-4d3e-9298-d4a1faca14b0";

// const su = await fetchData(`SELECT "A" as "strategyId", "B" as "unitId"
// FROM public."_StrategyToUnit"
// WHERE "A" = '${strategyId}'`);

// const st = await fetchData(`SELECT "A" as "strategyId", "B" as "tagId"
// FROM public."_StrategyToTag"
// WHERE "A" = '${strategyId}'`);

// const sg = await fetchData(`SELECT "B" as "strategyId", "A" as "gameId"
// FROM public."_StrategyToGame"
// WHERE "B" = '${strategyId}'`);

// console.log(su, st, sg);

// let update;
// update = await supabase.from("_TacticToTag").insert(
//   st.map((r) => ({
//     A: tacticId,
//     B: r.tagId,
//   })),
//   {
//     ignoreDuplicates: true,
//     onConflict: ["A", "B"],
//   }
// );

// console.log(update);

// update = await supabase.from("_TacticToUnit").insert(
//   su.map((r) => ({
//     A: tacticId,
//     B: r.unitId,
//   })),
//   {
//     ignoreDuplicates: true,
//     onConflict: ["A", "B"],
//   }
// );

// console.log(update);
// update = await supabase.from("_GameToTactic").insert(
//   sg.map((r) => ({
//     A: r.gameId,
//     B: tacticId,
//   })),

//   {
//     ignoreDuplicates: true,
//     onConflict: ["A", "B"],
//   }
// );

// console.log(update);
