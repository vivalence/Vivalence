import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";
import { fetchData } from "../clients/pg.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function remedy() {
  const error = {
    path: ["unit", "annotation", "pos"],
    type: "required",
    context: { unit: {}, tag: {}, adminUrl: "" },
  };

  const result = await post("/api/classifier/remedy", { error });
  console.log("remedy", result);
}

async function validate() {
  const START = 0;
  const TAKE = 100000;
  const pos = "verb";

  const { data: tag } = await supabase
    .from("Tag")
    .select(`*, _TagToUnit(*, Unit: B (*))`)
    .eq(`data->ONTOLOGICAL->>leaf`, pos)
    .eq(`data->ONTOLOGICAL->>branch`, "pos")
    .single();

  const units = tag._TagToUnit
    .map((r) => r.Unit)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(START, TAKE);

  console.log(units.length);
  const errors = [];

  for (const [i, unit] of units.entries()) {
    const result = await post("/api/classifier/validate/unit", { unit });
    if (result.error) return console.error(result.error);
    console.log(
      i + START,
      units.length,
      unit.id,
      unit.data.spanish,
      unit.data.english,
    );
    if (!result.data.isValid) {
      result.data.adminUrl = `${process.env.PUBLIC_ADMIN_URL}/unit/edit/${unit.id}`;
      result.data.unit = {
        id: unit.id,
        spanish: unit.data.spanish,
        english: unit.data.english,
      };
      errors.push(result.data);
    }
  }
  console.log(errors.length, (100 / units.length) * errors.length + "%");
  fs.writeFileSync(
    `src/corpus-work/errors/${pos}.json`,
    JSON.stringify(errors, null, 2),
  );
}

await remedy();
// await validate();
