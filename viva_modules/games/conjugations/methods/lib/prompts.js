export const GamePrompt = {
  language: { spoken: "english", learning: "spanish" },
  provider: { api: "anthropic", model: "claude-3-haiku-20240307" },
  schema: {
    title: "Evaluation",
    type: "object",
    properties: {
      reasoning: {
        description: "Explain how confident the user knows or doesn't <PART> why in short sentence",
        type: "string",
      },
      status: {
        title: "Evaluation status",
        description: `KNOWN indicates correct conjugation. UNKNOWN marks incorrect conjugation, including spelling or absence.`,
        enum: ["KNOWN", "UNKNOWN"],
        type: "string",
      },
    },
    required: ["reasoning", "status"],
  },
  template: `Evaluate this conjugation of {{{verb}}} from {{language.spoken}} to {{language.learning}} and return JSON:
tense: "{{{tense}}}"
person: "{{{person}}} {{{number}}}"
prompt: "{{{spoken}}}"
user input: "{{{input}}}"
correct: "{{{learning}}}"`,
};
