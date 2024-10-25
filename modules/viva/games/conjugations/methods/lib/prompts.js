export const EvalPrompt = {
  provider: { api: "anthropic", model: "claude-3-haiku-20240307" },
  schema: {
    title: "Evaluation of verb conjugation",
    type: "object",
    properties: {
      reasoning: {
        description: "Brief explanation of evaluation. Note any errors. Very brief, if correct.",
        type: "string",
      },
      status: {
        title: "Evaluation status",
        description: "KNOWN: perfectly correct, UNKNOWN: any error",
        enum: ["KNOWN", "UNKNOWN"],
        type: "string",
      },
      feedback: {
        description:
          "Short statement about the mistake and correct response. Only for UNKNOWN status.",
        type: "string",
      },
    },
    required: ["reasoning", "status"],
  },
  template: `Assess the user's verb conjugation.

Verb {{{verb}}} | {{{tense}}} | {{{person}}} | {{{number}}} | {{{mood}}}
{{{language.known}}}: {{{known}}} | {{{language.learning}}}: {{{learning}}}
User input: "{{{input}}}"

Rules:
- KNOWN: 100% correct (spelling, tense, person, number, mood)
- UNKNOWN: Any error, including minor spelling mistakes
- Ignore capitalization and extra spaces

Respond with JSON:
Did the user conjugate verb correctly?
1. reasoning: Brief explanation, note any errors
2. status: "KNOWN" or "UNKNOWN"
3. feedback: If UNKNOWN, provide a very short statement about the mistake and correct response
   Example feedback: "You used 'hablo' (I speak) instead of 'habla' (he/she/it speaks)."`,
};
