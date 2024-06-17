import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";
import {
  pos as POS,
  annotations,
} from "/Users/finn/vivalence/code/vivalence/app/client/src/routes/api/classifier/ontology";

let index = 0;
async function deduplicate() {
  while (true) {
    const { data: units, error } = await supabase
      .from("Unit")
      .select(`id, createdAt, data`)
      .order("createdAt", { ascending: false })
      .in("data->annotation->>pos", ["pron", "det"])
      .range(index, index + 1);

    if (units.length === 0) break;

    const { data: validation } = await post(
      "/api/classifier/units/deduplicate",
      {
        unit: units[0],
      },
    );
    console.log(index, "validation", validation);

    for (const issue of validation.issues) {
      // await post("/api/classifier/remedy", { issue });
    }
    index++;
  }
}
await deduplicate();
