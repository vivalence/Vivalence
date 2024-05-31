import fs from "fs";
import { post } from "../clients/client.js";
import {
  annotations,
  pos as POS,
} from "../../../client/src/routes/api/classifier/ontology";

async function predictAnnotationTags() {
  const ontologies = [];

  for (const [featKey, feat] of Object.entries(annotations)) {
    if (featKey === "lemma") continue;
    for (const option of feat.enum) {
      const ontology = { branch: featKey, leaf: option };
      ontologies.push(ontology);
    }
  }

  const { data, error } = await post("/api/classifier/tags/predict", {
    ontologies,
  });
  if (error) {
    console.error("error", error);
    process.exit(1);
  }

  console.log("data", data.issues[0]);
  console.log("data", data.issues.length);

  for (const issue of data.issues) {
    const remedy = await post("/api/classifier/remedy", { issue });
    console.log("remedy", remedy.data);
  }
}

async function predictLemmaTags() {
  const ontologies = [];

  POS.verb.lemmas.forEach((lemma) => {
    const ontology = { branch: "lemma", leaf: lemma };
    ontologies.push(ontology);
  });

  const { data, error } = await post("/api/classifier/tags/predict", {
    ontologies,
  });
  if (error) {
    console.error("error", error);
    process.exit(1);
  }

  console.log("data", data.issues[0]);
  console.log("data", data.issues.length);

  for (const issue of data.issues) {
    const remedy = await post("/api/classifier/remedy", { issue });
    console.log("remedy", remedy.data);
  }
}
