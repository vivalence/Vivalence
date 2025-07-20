// const provisionProvider = {api: "anthropic", model: "claude-3-5-haiku-latest", temperature: 0.7, max_tokens: 300,};

const provider = { api: "groq", model: "gemma2-9b-it" };

export const EvalPrompt = {
  provider: provider,
  schema: {
    title: "Evaluation of verb conjugation",
    type: "object",
    properties: {
      reasoning: {
        type: "string",
        description: "Brief explanation of evaluation. Note any errors. Very brief, if correct.",
      },
      status: {
        title: "Evaluation status",
        type: "string",
        description:
          "SUCCESS: perfectly correct, NEUTRAL: acceptable alternative, MISTAKE: any error",
        enum: ["SUCCESS", "NEUTRAL", "MISTAKE"],
      },
      feedback: {
        type: ["string", "null"],
        description: "Short statement about any errors, only for MISTAKE status",
      },
    },
    required: ["reasoning", "status"],
    additionalProperties: false,
  },
  template: `
### Example JSON responses:
Correct: {
  "reasoning": "hablo is the correct conjugation of haber in present singular first person",
  "status": "SUCCESS",
  "feedback": null
}

Incorrect: {
  "reasoning": "habla is wrong person conjugation - given he/she form instead of I form",
  "status": "MISTAKE",
  "feedback": "Use hablo (I speak) instead of habla (he/she speaks)"
}

Major error: {
  "reasoning": "havlamos has wrong spelling (hav), wrong number (we), wrong tense (present vs imperfect)",
  "status": "MISTAKE",
  "feedback": "Use hablaba (I was speaking) instead of havlamos (misspelled we speak)"
}

No input: {
  "reasoning": "No conjugation was provided for first person singular present",
  "status": "MISTAKE",
  "feedback": "The correct form is 'hablo' (I speak)"
}

### Instruction
Evaluate verb conjugation:
Prompt in known languge:: "{{{known}}}"
Expected correct response: "{{{learning}}}"
User's input: "{{{input}}}" (evaluate this)
User's input: "{{{input}}}" (evaluate this)

Context: {{#tags}}
{{branch}}: {{leaf}}{{/tags}}
native language: {{language.known}}
learning: {{language.learning}}

Rules:
- Ignore capitalization and extra spaces
- SUCCESS: Perfect match with expected conjugation
- NEUTRAL: Acceptable alternative form that's also correct
- MISTAKE: Any error in conjugation, including spelling
`,
};
// export const EvalPrompt = {
//   provider: { api: "anthropic", model: "claude-3-haiku-20240307" },
//   schema: {
//     title: "Evaluation of verb conjugation",
//     type: "object",
//     properties: {
//       reasoning: {
//         description: "Brief explanation of evaluation. Note any errors. Very brief, if correct.",
//         type: "string",
//       },
//       status: {
//         title: "Evaluation status",
//         description: "KNOWN: perfectly correct, UNKNOWN: any error",
//         enum: ["KNOWN", "UNKNOWN"],
//         type: "string",
//       },
//       feedback: {
//         description:
//           "Short statement about the mistake and correct response. Only for UNKNOWN status.",
//         type: "string",
//       },
//     },
//     required: ["reasoning", "status"],
//   },
//   template: `Assess the user's verb conjugation.

// Verb {{{verb}}} | {{{tense}}} | {{{person}}} | {{{number}}} | {{{mood}}}
// {{{language.known}}}: {{{known}}} | {{{language.learning}}}: {{{learning}}}
// User input: "{{{input}}}"

// Rules:
// - KNOWN: 100% correct (spelling, tense, person, number, mood)
// - UNKNOWN: Any error, including minor spelling mistakes
// - Ignore capitalization and extra spaces

// Respond with JSON:
// Did the user conjugate verb correctly?
// 1. reasoning: Brief explanation, note any errors
// 2. status: "KNOWN" or "UNKNOWN"
// 3. feedback: If UNKNOWN, provide a very short statement about the mistake and correct response
//    Example feedback: "You used 'hablo' (I speak) instead of 'habla' (he/she/it speaks)."`,
// };
