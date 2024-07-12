import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";

import {
  annotations,
  pos as POS,
} from "../../../client/src/routes/api/classifier/ontology";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const index = 0;
const TAKE = 40;
const START = TAKE * index;

let count = 0;
const MAX_RUNS = 10;
const BATCHSIZE = 50;

async function getUnits() {
  const { data: units, error } = await supabase
    .from("Unit")
    .select(`id, createdAt, data`)
    .order("createdAt", { ascending: false })
    .in("data->annotation->>pos", ["pron", "det"])
    .range(START, START + TAKE - 1);

  return units;
}
let units = await getUnits();
console.log("units", units.length);

while (count < MAX_RUNS) {
  console.log(" ");
  console.log("getting issues...", count++ + 1, "of", MAX_RUNS, "runs");

  // validate

  console.log("validating units...", units.length);
  async function validateUnitsInBatches(units, batchSize) {
    const issues = [];

    async function validateUnits(units, bi) {
      const promises = units.map(async function (unit) {
        const response = await post("/api/classifier/units/validate", { unit });
        if (response.error) throw response.error;
        return response.data.issues;
      });
      const unitIssues = await Promise.all(promises);

      unitIssues
        .flat()
        .filter((i) => i)
        .filter((issue) => issue.violation !== "conditional")
        .forEach((issue) => issues.push(issue));
    }

    for (let i = 0; i < units.length; i += batchSize) {
      const batch = units.slice(i, i + batchSize);
      await validateUnits(batch, i);
      console.log("validated", i + batchSize, "of", units.length);
    }

    return issues;
  }
  let issues = await validateUnitsInBatches(units, BATCHSIZE);

  // console.log("issues", issues);
  console.log("issues", issues.length);
  // continue;
  // issues

  const totalIssueCount = issues.length;
  if (totalIssueCount === 0) {
    console.log("\n\n[BATCH IS CLEAN]\n");
    break;
  }
  function orderIssues(issues) {
    const todo = [];
    const order = ["mismatch", "invalid", "unique", "forbidden", "required"];
    for (const violation of order) {
      issues
        .filter((issue) => issue.violation === violation)
        .map((i) => {
          if (!todo.find((t) => t.context.unit.id === i.context.unit.id)) {
            todo.push(i);
          }
        });
      if (todo.length === 0) continue;
    }

    if (
      todo.length !==
      todo.filter(
        (i, index) =>
          todo.findIndex((j) => j.context.unit.id === i.context.unit.id) ===
          index,
      ).length
    ) {
      console.log("DUPLICATE ISSUES");
      throw new Error("DUPLICATE ISSUES");
    }
    return todo;
  }
  issues = orderIssues(issues);
  units = issues.map((i) => i.context.unit);

  // remedy

  async function remedyIssuesInBatches(issues, batchSize) {
    async function remedyIssues(batch, bi) {
      const promises = batch.map(async (issue, i) => {
        const response = await post("/api/classifier/remedy", { issue });

        if (response.error) {
          console.log(`Error: ${bi + i}/${batch.length} ->`, response.error);
        } else {
          console.log(
            `${count} - ${bi + i}/${issues.length}(${totalIssueCount}) => ${issue.violation} => ${response.data.resolved}`,
          );
        }
      });
      await Promise.all(promises);
    }

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      await remedyIssues(batch, i);
    }
  }
  await remedyIssuesInBatches(issues, BATCHSIZE);
}
