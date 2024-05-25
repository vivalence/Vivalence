import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";

// i should be fetching ontological statements.
const { data } = await post("/api/classifier/validate/ontology/tags");

console.log("data", data);

for (const issue of data.issues) {
  const remedy = await post("/api/classifier/remedy", { issue });
  console.log("remedy", remedy.data);
}
