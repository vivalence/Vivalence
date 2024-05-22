import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pos = [
  "adj",
  "adp",
  "adv",
  "aux",
  "cconj",
  "det",
  "intj",
  "noun",
  "num",
  "part",
  "pron",
  "propn",
  "punct",
  "sconj",
  "verb",
];

const branch = "pos";
const leaf = pos[0];

const START = 0;
const TAKE = 100000;

let perf = performance.now();

const units = await (async function getUnits({ leaf, branch }) {
  const { data: tag, error } = await supabase
    .from("Tag")
    .select(`*, _TagToUnit(*, Unit: B (*))`)
    .eq(`data->ONTOLOGICAL->>branch`, branch)
    .eq(`data->ONTOLOGICAL->>leaf`, leaf)
    .single();

  const units = tag._TagToUnit
    .map((r) => r.Unit)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(START, START + TAKE);

  const promises = units.map(async function (unit) {
    const { data, error } = await supabase
      .from("Unit")
      .select(`*, _TagToUnit(*, Tag: A (*))`)
      .eq("id", unit.id)
      .single();
    unit.tags = data._TagToUnit.map((r) => r.Tag);
    return unit;
  });

  return await Promise.all(promises);
})({ leaf, branch });

console.log("units", units.length, "in", performance.now() - perf, "ms");

const unitIssues = await (async function validateUnits(units) {
  const promises = units.map(async function (unit) {
    const { data, error } = await post("/api/classifier/validate/unit", {
      unit,
    });
    if (error) throw error;
    return data.issues;
  });
  let unitIssues = await Promise.all(promises);

  unitIssues = unitIssues
    .flat()
    .filter((i) => i)
    .filter((issue) => issue.violation !== "conditional")
    .sort((a, b) => {
      const order = ["mismatch", "forbidden", "unique", "required", "ivalid"];
      return order.indexOf(a.violation) - order.indexOf(b.violation);
    });

  return unitIssues;
})(units);

console.log("unitIssues", unitIssues.length, "in", performance.now() - perf);

for (const [i, issue] of unitIssues.entries()) {
  try {
    perf = performance.now();
    console.log("\n");
    console.log("[ISSUE INDEX]", i, "of", unitIssues.length - 1);
    const response = await post("/api/classifier/remedy", { issue });
    const { data: resolution, error } = response;
    if (error) throw error;
    console.log("handled:", resolution.resolved);
    console.log("in", performance.now() - perf);
  } catch (error) {
    console.error("[REMEDY ERROR]", i, error);
  }
}
