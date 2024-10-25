import annotation from "./annotation/index.js";
import tag from "./tag/index.js";

async function required(issue, ctx) {
  let resolved = { resolved: false };
  const schema = ctx.runtime.schema;

  const annotation = issue.context.annotation;
  const llmInput = {
    prompt: `### Task: Complete Spanish Language Unit
You are given an annotation and return a the corresponding data object, containing the known (english), learning (spanish) and an example sentence in both languages.
the unit represents a single spanish language word. the annotation is provided by universal dependencies. pay special attention to the lemma, pos, and in case of verbs, verbform, mood, tense, aspect, number, and person.
 
The annotation is provided below, and you should provide a new data object that completes the unit.

### Annotation
\`\`\`json
${JSON.stringify(annotation, null, 2)}
\`\`\`

### Examples
This is what high quality data looks like:
{"data: {"known": "they say", "learning": "digan", "example":{"kown": "They say the truth.", "learning": "Digan la verdad."}}, "annotation": {"pos": "verb", "lemma": "decir", "verbform": "fin", "mood": "imp", "tense": "pres", "aspect": "imp", "number": "plur", "person": "3"}} 
{"known": "doctor", "learning": "médico", "annotation": {"pos": "noun", "lemma": "médico", "gender": "masc", "number": "sing"}, "example":{"known": "Speak with your doctor.", "learnign": "Hable con su médico."}}
Notice how simple and straightforward english, spanish and the examples are. there is no complication, no brackets, no jargon, no technical terms. only simple, clear, and easy to understand language. strive for this simplicity and clarity.

### Notes
estimate the index. lower means unit is more frequently used.

### Output
`,
    schema: {
      type: "object",
      properties: {
        reasoning: {
          type: "string",
          description: `1: Summarize the task and success criteria in 2 sentences.
2: describe the input data and its various features and what they each hint at.
3: describe what workd unit this annotation represents, and why.
4: describe what a good data object would look like, given that the goal is for a language learner to learn the unit.`,
        },
        unit: schema.unit.properties.data,
      },
      required: ["reasoning", "unit"],
      additionalProperties: false,
    },
    provider: {
      api: "openai",
      model: "gpt-4o-mini",
    },
  };
  const slug = await ctx.runtime.call("/units/slugFromAnnotation", { annotation });
  const data = await ctx.runtime.services.llm(llmInput);
  const unit = { slug, annotation, data: data.unit };
  console.log("unit", JSON.stringify(unit, null, 2));

  return resolved;
  const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit });

  if (!issues[0]) {
    const installed = await ctx.runtime.call("/install/unit", { unit });
    // console.log("installed", installed);

    const removed = await ctx.runtime.call("/remove/unit", { unit });
    // console.log("removed", removed);

    // resolved = { resolved: !result.error, unit: { data: result.data }, from: "llm" };
    // if (result.error) resolved.error = result.error;
  }
  return resolved;
}

async function forbidden(issue, ctx) {
  const unit = issue.context.unit;
  const response = await ctx.runtime.locals.supabase.from("Unit").delete().eq("id", unit.id);
  return { resolved: !response.error, unit: { id: unit.id }, error: response.error };
}

async function invalid(issue, ctx) {
  // const schema = ctx.runtime.module.Ontology.schema;
  let resolved = { resolved: false };
  throw new Error("check why context.unit is used for llm schema unit");
  const unit = issue.context.unit;

  await (async function fromLLM() {
    const { data, error } = await ctx.runtime.services.llm({
      prompt: ((unit) => {
        return `### Task: Autocorrect Spanish Language Unit
You are given a unit of data that represents a spanish language word, its english translation, an annotation provided by universal dependencies, and a set of usage examples. 
Your task is to improve the data object, such that it is the most accurate representation of the word in question, with the most accurate annotation, and the most useful and accessible usage examples.
The data object is provided below, and you should provide a new data object that is an improvement on the original.

### Input
Improve this data object:
\`\`\`json
${JSON.stringify(unit.data, null, 2)}
\`\`\`

### Examples
This is what high quality data looks like:
{"known": "they say", "learning": "digan", "annotation": {"pos": "verb", "lemma": "decir", "verbform": "fin", "mood": "imp", "tense": "pres", "aspect": "imp", "number": "plur", "person": "3"}, "example":{"kown": "They say the truth.", "learning": "Digan la verdad."}}
{"known": "doctor", "learning": "médico", "annotation": {"pos": "noun", "lemma": "médico", "gender": "masc", "number": "sing"}, "example":{"known": "Speak with your doctor.", "learnign": "Hable con su médico."}}
Notice how simple and straightforward known - english, learning - spanish and the examples are. there is no complication, no brackets, no jargon, no technical terms. only simple, clear, and easy to understand language. strive for this simplicity and clarity.

### Output
estimate the index. lower means unit is more frequent.
If the unit is already correct and cannot be improved, leave 'properties.unit' empty.

`;
      })(unit),
      schema: {
        type: "object",
        properties: {
          reasoning: {
            type: "string",
            description: `
1: Summarize the task and success criteria in 2 sentences.
2: write about the data you are given, and if it is correct or incorrect, and if it matches the criteria.
3: if its incorrect, describe what the problem is, and what the correction must be.
`,
          },
          unit: unit.schema,
        },
        required: ["reasoning"],
      },
      provider: {
        api: "openai",
        model: "gpt-4o",
      },
    });

    if (error) throw error;
    if (data.unit && data.unit.spanish && data.unit.annotation) {
      const result = await ctx.runtime.locals.supabase
        .from("Unit")
        .update({
          updatedAt: new Date().toISOString(),
          data: data.unit,
        })
        .eq("id", unit.id);
    }
    resolved = { resolved: !error, unit: { data: data.unit }, from: "llm" };
  })();
  resolved.annotation = issue.context.annotation;
  return resolved;
}

export default {
  handlers: { required, invalid, forbidden },
  path: ["unit"],
  children: [annotation, tag],
};
