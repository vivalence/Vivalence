import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";
import {
  pos as POS,
  annotations,
} from "/Users/finn/vivalence/code/vivalence/app/client/src/routes/api/classifier/ontology";

async function predictSpace() {
  const spaces = (() => {
    return Object.keys(POS)
      .filter((pos) => {
        return POS[pos].annotationSpace;
      })
      .map((pos) => {
        return POS[pos].annotationSpace;
      })
      .flat();
  })();

  for (const space of spaces) {
    const { data: prediction, error } = await post(
      "/api/classifier/validate/ontology/units/predict",
      { space: space },
    );
    if (error) {
      console.error("[error]");
      console.error(error);
      continue;
    }

    console.log("prediction issues", prediction.issues);
    prediction.issues.map((i) =>
      console.log(
        `${i.path?.join(" > ")} ${i.context?.annotation?.lemma} ${i.violation} ${i.message}`,
      ),
    );
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
