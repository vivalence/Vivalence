export const EvalTranslationPrompt = {
  provider: { api: "groq", model: "llama3-70b-8192", max_tokens: 8192, temperature: 0.8 },
  schema: {
    title: "Evaluation of Translation",
    type: "object",
    definitions: {
      translation: {
        type: "string",
        description: `In 3 short sentences: describe 1: the linguistic attributes of the original sentence and the provided translation. 2: argue if the user got the translation right over all. and 3: what errors where made and in what specific parts of speech. `,
      },
      token: {
        type: "string",
        description:
          "In a sentence, describe 1: this <token> of the translation, 2: if the token is translated correctly?, 3: Are each tag attributes correct? and if there is an error 4: what would be the correctly translated word?",
      },
    },
    properties: {},
  },
  template: `# TASK
Evaluate a translated sentence. The translation is from {{{language.known}}} to {{{language.learning}}}.
A: reason and describe the correctness of the translation as a whole.
B: describe and evaluate each token:$token of speech individually.
ignore capitalization. do not ignore severe spelling errors.
ud = Universal Dependencies 

### TRANSLATION
original sentence: "{{{sentence.known}}}"
original sentence: "{{{sentence.known}}}"
expected translation: "{{{sentence.learning}}}" 
user translation: "{{{sentence.translation}}}"
user translation: "{{{sentence.translation}}}"

### TOKENS / PARTS OF SPEECH
{{#parts}}
# Part {{index}}
Token: "{{{known}}}":"{{{token}}}"
{{#tags}}
Tag: "{{name}}" "{{branch}}:{{leaf}}"
{{/tags}}

{{/parts}}
`,
};
export const EvalTokensPrompt = {
  provider: {
    api: "anthropic",
    model: "claude-3-haiku-20240307",
    max_tokens: 1000,
    temperature: 0.8,
  },
  schema: {
    title: "Evaluations",
    type: "object",
    definitions: {
      status: {
        description: `KNOWN indicates correct usage of PART in the translation. UNKNOWN marks incorrect usage, including spelling and missing words. NEUTRAL applies for successful alternative use. Absence of PART is UNKNOWN.`,
        enum: ["KNOWN", "UNKNOWN", "NEUTRAL"],
        type: "string",
      },
      unit: {
        type: "object",
        description: "Evaluation of the unit / word.",
        properties: {
          status: { $ref: "#/definitions/status" },
          correction: {
            type: "string",
            description: "If the status is UNKNOWN, provide the corrected word.",
          },
          feedback: {
            type: "string",
            description:
              "If the status is UNKNOWN, provide concise, factual feedback to the user. No more than a one sentence.",
          },
        },
        required: ["status"],
      },
      tag: {
        type: "object",
        description: "Evaluation of the universal dependency tags correctness.",
        properties: { status: { $ref: "#/definitions/status" } },
        required: ["status"],
      },
    },
    properties: {},
  },
  template: `# INSTRUCTIONS
input: two evaluations of a translation. One for the whole translation and one for a specific <PART>.
task: format and articulate the evaluation of the <PART> of speech.
output: JSON. For the Unit a status enum and optional feedback and correction. For Tags respond with status enum. 

If the learner used equivalent alternative vocabulary, then select NEUTRAL. if you are unsure, select NEUTRAL. If the <PART> is missing, then select UNKNOWN.
If you reference the Unit, call it a word.
You can improve the evaluation. If there are mistakes in the evaluation, correct the mistakes.

### TRANSLATION
from {{{language.known}}} to {{{language.learning}}}
original sentence: "{{{sentence.known}}}"
expected translation: "{{{sentence.learning}}}" (the tag <PART> was added now for your emphasis) "{{{sentence.learning}}}" (the tag <PART> was added now for your emphasis)
user translation: "{{{sentence.translation}}}"

The <PART> you evaluate now is made up of the word (Unit) "{{part.token}}"
and the UniversalDependencys (Tags) of{{#part.tags}} {{branch}}{{/part.tags}}.

### EVALUATION
of the whole translation:
{{{evaluation.whole}}}

of your specific <PART>:
{{{evaluation.token}}}

You can improve the evaluation. If there are mistakes in the evaluation, please correct them.

### "Unit:{{part.id}}" {{{part.known}}} {{{part.token}}}
{{#part.tags}}
### "Tag:{{id}}" {{branch}}:{{leaf}} {{name}} 
{{/part.tags}}`,
};

export const GamePrompt = {
  // provider: {api: "anthropic", model: "claude-3-sonnet-20240229", temperature: 0.5, max_tokens: 256},
  provider: { api: "openai", model: "gpt-4o" },
  schema: {
    title: "LanguageLearningSentence",
    type: "object",
    properties: {
      known: {
        title: "Sentence in Known Language",
        description: "Sentence in the familiar language",
        type: "string",
      },
      learning: {
        title: "Sentence in Learning Language",
        description: "Sentence in the language to be learned",
        type: "string",
      },
    },
    required: ["known", "learning"],
  },
  template: `### Instructions
You Generate one single sentence in {{language.known}} and its translation in {{language.learning}} as language learning material for a user learning {{language.learning}}.

Follow this strategy:
<STRATEGY>

{{innerPrompt}}

</STRATEGY>

Don't use words more advanced than those provided. We want the learner to be successfull.
The sentence must be semantically correct and either a reasonable or common thing to say.

### Constraints
Build the sentence using these constraints:
{{#constraints}}
{{.}}
{{/constraints}}

Return a JSON object with the known and learning sentence.`,
};
