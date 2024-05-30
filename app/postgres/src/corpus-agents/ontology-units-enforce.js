import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MAX_RUNS = 10;
let count = 0;

while (count <= MAX_RUNS) {
  console.log(" ");
  console.log("getting issues...", count, "of", MAX_RUNS, "runs");

  let { data: issues } = await post(
    "/api/classifier/validate/ontology/units/enforce",
    {},
  );

  console.log("issues found:", issues.length);
  // console.log("issues", JSON.stringify(issues.slice(0, 3), null, 2));

  if (issues.length === 0) {
    count = MAX_RUNS + 1;
    break;
  }

  const order = ["mismatch", "invalid", "required", "forbidden", "unique"];
  for (const violation of order) {
    let todo = issues.filter((issue) => issue.violation === violation);
    if (todo.length === 0) continue;
    // if i should also sort paths
    console.log("doing violation:", violation, "; count:", todo.length);
    issues = todo;
    break;
  }

  const remedies = await (async function remedyIssues(issues) {
    const remedies = [];
    for (const [i, issue] of issues.entries()) {
      const { data: remedy, error } = await post("/api/classifier/remedy", {
        issue,
      });

      if (error) return console.log(`Error: ${i}/${issues.length} ->`, error);
      console.log(
        `Fix: ${i}/${issues.length} =>   ${issue.violation} =>  `,
        remedy.resolved,
      );

      remedies.push(remedy);
    }
  })(issues);

  count++;
}
