import fs from "fs";
import supabase from "../clients/supabase.js";
import { post } from "../clients/client.js";
import { pos as POS } from "/Users/finn/vivalence/code/app/packages/client/src/routes/api/classifier/ontology";

const leafs = (() => {
  return [
    // "verb", // verb 7584
    // "noun", // noun 3247
    // "adj", // adj	1014
    // "aux", // aux	812
    // "adv", // adv	186
    // "pron", // pron 73
    // "num", // num	33
    // "adp", // adp	28
    // "intj", // intj 23
    // "det", // det	19
    "sconj", // sconj 9
    // "cconj", // cconj 6
    // "propn", // propn 3
  ];
})();
let count = 0;

for (const leaf of leafs) {
  const branch = "pos";
  let pos = { ...POS[leaf] };
  pos.id = leaf;

  console.log(pos);
  const units = await (async function getUnits({ leaf, branch }) {
    const { data: tag, error } = await supabase
      .from("Tag")
      .select(`*, _TagToUnit(*, Unit: B (*))`)
      .eq(`data->ONTOLOGICAL->>branch`, branch)
      .eq(`data->ONTOLOGICAL->>leaf`, leaf)
      .single();

    const units = tag._TagToUnit
      .map((r) => r.Unit)
      .sort((a, b) => a.createdAt - b.createdAt);

    return units;
  })({ leaf, branch });

  const proposedUnits = await (async function getProposedUnits(units, pos) {
    const input = {
      prompt: ((units, pos) => {
        return `### Task
You autocomplete units that are missing from the database:
Propose units that are missing from the database for the universal dependencie part of speech (pos) ${pos.id} in the language "Spanish".
In form of an array of objects that agree with the json schema definition found in: pos ${pos.id}.

### Database
All units currently in the database for the pos ${pos.id}:
\`\`\`json
${units.map((unit) => JSON.stringify(unit.data)).join("\n")}
\`\`\`
Don't include any units that are already in the database in your response.
Unique units are identified by their annotation pos and lemma.

### Output
Propose missing units for the pos ${pos.id} in the language "Spanish".
Return an array of objects (array! of units!) that agree with the json schema definition found in: pos ${pos.id}.
Array of units!
return between 3 to 6 new units! if there are missing units! 
if there are 0 missing units, return an empty array!

the units you return must be new, and not part of the context. ie. not in my database already!
\`\`\`json
[
    { spanish, english, annotation {} }
    { spanish, english, annotation {} }
    { spanish, english, annotation {} }
    { spanish, english, annotation {} }
    { spanish, english, annotation {} }
    { spanish, english, annotation {} }
]
\`\`\`
RETURN ZERO (0, NONE, NULL) UNITS THAT ARE ALREADY IN THE DATABASE!
`;
      })(units, pos),
      schema: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "Proposed Unit",
        type: "object",
        definitions: {
          [pos.id]: pos.schema,
        },
        properties: {
          reasoning: {
            type: "string",
            description: `
1: summarize the task in 1 sentence, and how many units you will return.
2: List the new units, that are not in the datebase, you will return as an array of strings.
3: write a sentence about units that are still missing and need to be added in the future.
`,
          },
          shouldCallAgain: {
            type: "boolean",
            description:
              "If true, this function will be called again to get more units in the future. only set this true, if there are more units missing than the ones returned.",
          },
          units: {
            type: "array",
            items: {
              $ref: `#/definitions/${pos.id}`,
            },
          },
        },
      },
    };
    const { data } = await post(
      "/api/classifier/validate/ontology/units/autocomplete",
      input,
    );

    return data;
  })(units, pos);

  console.log("proposedUnits:");
  console.log(JSON.stringify(proposedUnits, null, 2));

  fs.writeFileSync(
    `./proposed-units-${leaf}-${count}.json`,
    JSON.stringify(proposedUnits, null, 2),
  );
}

// const proposedUnits = await (async function getProposedUnits(units, pos) {const input = {prompt: ((units, pos) => {return `### Task You autocomplete units that are missing from the database: Propose units that are missing from the database for the universal dependencie part of speech (pos) ${pos.id} in the language "Spanish". In form of an array of objects that agree with the json schema definition found in: pos ${pos.id}. ### Database All units currently in the database for the pos ${pos.id}: \`\`\`json ${units.map((unit) => JSON.stringify(unit.data)).join("\n")} \`\`\` Don't include any units that are already in the database in your response. Unique units are identified by their annotation pos and lemma. ### Output Propose missing units for the pos ${pos.id} in the language "Spanish". Return an array of objects (array! of units!) that agree with the json schema definition found in: pos ${pos.id}. Array of units! return between 3 to 6 new units! if there are missing units! if there are 0 missing units, return an empty array! the units you return must be new, and not part of the context. ie. not in my database already! \`\`\`json [{ spanish, english, annotation {} } { spanish, english, annotation {} } { spanish, english, annotation {} } { spanish, english, annotation {} } { spanish, english, annotation {} } { spanish, english, annotation {} }] \`\`\` RETURN ZERO (0, NONE, NULL) UNITS THAT ARE ALREADY IN THE DATABASE! `;})(units, pos), schema: {$schema: "https://json-schema.org/draft/2020-12/schema", title: "Proposed Unit", type: "object", definitions: {[pos.id]: pos.schema,}, properties: {reasoning: {type: "string", description: ` 1: summarize the task in 1 sentence, and how many units you will return. 2: List the new units, that are not in the datebase, you will return as an array of strings. 3: write a sentence about units that are still missing and need to be added in the future. `,}, shouldCallAgain: {type: "boolean", description: "If true, this function will be called again to get more units in the future. only set this true, if there are more units missing than the ones returned.",}, units: {type: "array", items: {$ref: `#/definitions/${pos.id}`,},},},},}; const { data } = await post("/api/classifier/validate/ontology/units/autocomplete", input,); return data;})(units, pos);
