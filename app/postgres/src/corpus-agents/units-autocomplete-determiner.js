import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";
import {
  pos as POS,
  annotations,
} from "/Users/finn/vivalence/code/vivalence/app/client/src/routes/api/classifier/ontology";

import determiners from "./data.determiners.js";

function measure() {
  const annotationSpace = new Map();

  for (const det of determiners.negative) {
    for (const [branch, leaf] of Object.entries(det.annotation)) {
      if (!annotationSpace.has(branch)) {
        annotationSpace.set(branch, []);
      }
      annotationSpace.get(branch).push(leaf);
    }
  }
  const counts = new Map();
  for (const [branch, leaves] of annotationSpace) {
    for (const leaf of leaves) {
      let key = `${branch}/${leaf}`;
      if (!counts.has(key)) {
        counts.set(key, 0);
      }
      counts.set(key, counts.get(key) + 1);
    }
  }
  console.log(counts);
}
// measure();

async function predictSpace() {
  const spaces = (() => {
    return POS.det.annotationSpace;
  })();

  for (const space of spaces) {
    const { data: prediction } = await post(
      "/api/classifier/validate/ontology/units/predict",
      { space: space },
    );

    prediction.issues.map((i) =>
      console.log(
        `${i.path.join(" > ")} ${i.violation} ${i.context.unit?.data.spanish} ${i.message}`,
      ),
    );
    // console.log("prediction issues", prediction.issues);
    console.log("prediction issues", prediction.issues.length);
    continue;

    for (const [i, issue] of prediction.issues.entries()) {
      const { data: remedy, error } = await post("/api/classifier/remedy", {
        issue,
      });
      if (!remedy.resolved) {
        console.log("[PROBLEM IN RESOLUTION]");
        console.log("issue:", JSON.stringify(issue, null, 2));
        console.log("remedy:", JSON.stringify(remedy, null, 2));
        console.log("error:", JSON.stringify(error, null, 2));
      }
      console.log(remedy);
    }
  }
}
await predictSpace();
