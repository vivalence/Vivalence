import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";
import {
  annotations,
  pos as POS,
} from "/Users/finn/vivalence/code/vivalence/app/client/src/routes/api/classifier/ontology";

async function predictSpace() {
  const spaces = (() => {
    // return Object.keys(POS) .filter((pos) => POS[pos].annotationSpace) .map((pos) => POS[pos].annotationSpace) .flat();
    return [...POS.det.annotationSpace];
  })();

  for (const space of spaces) {
    console.log("predicting space...");
    const { data: prediction, error } = await post(
      "/api/classifier/units/predict",
      { space: space },
    );
    if (error) {
      console.error("[error]");
      console.error(error);
      continue;
    }

    // console.log("prediction issues", prediction.issues);
    // prediction.issues.map((i) => console.log(`${i.path?.join(" > ")} ${i.context?.annotation?.lemma || i.context?.unit?.spanish} ${i.violation} ${i.message}`,),);
    console.log("prediction issues", prediction.issues.length);
    // continue;

    for (const [i, issue] of prediction.issues.entries()) {
      const { data: remedy, error } = await post("/api/classifier/remedy", {
        issue,
      });

      if (error || !remedy.resolved) {
        console.log("[PROBLEM IN RESOLUTION]");
        console.log("issue:", JSON.stringify(issue, null, 2));
        console.log("remedy:", JSON.stringify(remedy, null, 2));
        console.log("error:", JSON.stringify(error, null, 2));
      } else {
        console.log(
          `${i}/${prediction.issues.length} => ${issue.violation} => ${remedy.resolved}`,
        );
      }
    }
  }
}
await predictSpace();
