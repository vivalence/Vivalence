import fs from "node:fs";
import supabase from "../clients/supabase.js";
import fetchData from "../clients/pg.js";

const referenceDate = new Date("2024-07-31T00:00:00.000Z");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const START = 0;
const TAKE = 100000;
const BATCHSIZE = 500;
const BATCHINTERVAL = 1000;

let index = START;

async function scope() {
  const response = await supabase
    .from("Unit")
    .select("*")
    .lte("updatedAt", referenceDate.toISOString())
    .order("updatedAt", { ascending: true })
    .range(START, START + TAKE - 1);

  if (response.error) return console.error(response.error);

  console.log("ops avail", response.data.length);
  const units = response.data.filter((unit) => !unit.data.lemma);
  console.log("ops to do", units.length);

  async function update(unit, index) {
    try {
      // console.log("unit", unit.data);
      const annotation = unit.data.annotation;
      const data = {
        index: unit.data.index,
        known: unit.data.english,
        learning: unit.data.spanish,
        example: {
          known: unit.data.usageInEnglish,
          learning: unit.data.usageInSpanish,
        },
      };
      // console.log("unit", { annotation, data });

      await supabase
        .from("Unit")
        .update({
          updatedAt: new Date(),
          runtimeId: "c9e2eacf-eaef-47de-bf6b-3aac4d3e8590",
          annotation,
          data,
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
