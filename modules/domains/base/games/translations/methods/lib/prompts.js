const provisionProvider = {
  api: "anthropic",
  model: "claude-3-5-sonnet-latest",
  temperature: 0.7,
  max_tokens: 300,
};
const sentenceEvalProvider = {
  api: "groq",
  model: "llama-3.3-70b-versatile",
};
const tokenEvalProvider = {
  api: "groq",
  model: "gemma2-9b-it",
  // model: "llama-3.3-70b-versatile",
};

export const GamePrompt = {
  provider: provisionProvider,
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
    required: ["learning", "known"],
    additionalProperties: false,
  },
  template: `
### Context
<SENTENCE_PATTERNS_GUIDE>
When constructing your sentence, consider these common sentence patterns:

STATEMENT: Create a simple declarative sentence that states a fact
- Structure: Subject + Verb + Complement with natural word order

QUESTION: Form an interrogative sentence using appropriate question structure
- Structure: Question word + Verb + Subject (or appropriate inversion)

NEGATION: Create a sentence with proper negation markers
- Structure: Subject + Negation marker + Verb + Complement

TEMPORAL: Include time expressions appropriate to the tense
- Structure: (Time expression) + Subject + Verb + Complement

CONDITIONAL: Form a conditional sentence showing cause and effect
- Structure: [condition phrase] + [condition clause], [result clause]

COMPARATIVE: Create a comparison between two elements
- Structure: [Element 1] + [comparative term] + [Element 2]

REFLEXIVE: Use a reflexive verb with proper pronoun agreement
- Structure: Reflexive pronoun + Verb + Complement

IMPERATIVE: Form a command using the imperative mood
- Structure: Verb in imperative form + Complement


<COMPLEXITY_LEVELS>
A1 (Beginner): Very basic personal expressions, 300-500 most common words, present tense, simple sentences
A2 (Elementary): Expressions for areas of immediate relevance, 1000-1500 common words, basic past/future tenses
B1 (Intermediate): Clear standard speech on familiar matters, 2000-3500 words, all major tenses
B2 (Upper Intermediate): Complex discussions in specialized fields, 3500-5000 words, all tenses, complex structures


### Instructions
You are an expert language teacher generating educational content. 
The learner's native language is {{language.known}} and the target language being learned is {{language.learning}}.
Generate one single sentence in {{language.known}} and its translation in {{language.learning}} as language learning material.
You are given a GOAL that you must follow. The goal is a specific objective that the sentence and translation must achieve. The ultimate goal is educational.
You are also given a set of CONSTRAINTS. You must generate a sentence that satisfies these constraints.

<GOAL>
{{goal}}
</GOAL>

<CONSTRAINTS>
Don't use words more advanced than those provided. We want the learner to be successful.
The sentence must be semantically correct and either a reasonable or common thing to say.
{{#constraints}}
{{.}}
{{/constraints}}
</CONSTRAINTS>

`,
};

export const EvalTranslationPrompt = {
  provider: sentenceEvalProvider,
  schema: {
    title: "Evaluation of Translation",
    type: "object",
    description: `GLOBAL INSTRUCTION: Stay !concise, dense and compact! in your responses. Never mention formatting (<>) or the prompt itself.`,
    definitions: {
      translation: {
        type: "string",
        description: `In 3 !concise, dense and compact! sentences 1: the linguistic attributes of the original sentence and the provided translation. 2: argue if the user got the translation right over all. and 3: what errors where made and in what specific parts of speech. `,
      },
      token: {
        type: "string",
        description:
          "In one !concise, dense and compact! sentence 1: identify the <token> in the user translation. 2(only if there is an error): assess if the token is translated correctly. 3: Are each ud annotation correct? 4(only if there is an error): what would be the correction?",
      },
    },
    properties: {},
    additionalProperties: false,
  },
  template: `# TASK
Evaluate and assess the correctness of the translated sentence below.
The translation is by a language learner, from {{{language.known}}} to {{{language.learning}}}.
The learner is translating from their native language to a language they are learning.

You are given:
The original sentence in {{{language.known}}}.
An expected translation, which should serve as an orientation, but not a absolute source of truth.
And the 'user translation', which is the thing you must evaluate.
The list of tokens that make up the sentence and the Universal Dependencies (ud) annotations for each token.

Task A: Reason and describe the correctness of the translation as a whole.
Task B: Describe and evaluate each individual token individually, with respect payed to each ud annotation.
Note: Ignore capitalization. Do not ignore severe spelling errors. Missing counts as failure.


### TRANSLATION
original sentence: "{{{sentence.known}}}"
original sentence: "{{{sentence.known}}}"
expected translation: "{{{sentence.learning}}}" 
expected translation: "{{{sentence.learning}}}" 
user translation: "{{{sentence.translation}}}"
user translation: "{{{sentence.translation}}}"
user translation: "{{{sentence.translation}}}"

### TOKENS / PARTS OF SPEECH (universal dependencies - ud)
{{#parts}}
| token index | token known | token learning | ud name | ud branch | ud leaf |
{{#tags}}
| {{index}} | {{{known}}} | {{{token}}} | {{name}} | {{branch}} | {{leaf}} |
{{/tags}}
{{/parts}}
`,
};
export const EvalTokensPrompt = {
  provider: tokenEvalProvider,
  schema: {
    type: "object",
    title: "Evaluation of Token",
    description: `GLOBAL INSTRUCTION: Stay !concise, dense and compact! in your responses. Never mention formatting (<>), annotation (ud) or the prompt itself. Dont show how the sausage is made.`,
    properties: {
      status: {
        type: "string",
        enum: ["KNOWN", "UNKNOWN", "NEUTRAL"],
        description: `KNOWN indicates correct usage of PART in the translation. UNKNOWN marks incorrect usage, including spelling and missing words. NEUTRAL applies for successful alternative use. Absence of PART is UNKNOWN.`,
      },
      correction: {
        type: ["string", "null"],
        description: "If the status is UNKNOWN, provide the corrected word.",
      },
      feedback: {
        type: ["string", "null"],
        description:
          "If the status is UNKNOWN, provide concise, factual feedback to the user. No more than a one sentence. Leave empty if feedback is not necessary/positive.",
      },
    },
    required: ["status", "correction", "feedback"],
    additionalProperties: false,
  },
  template: `
# EXAMPLES of GOOD JSON OUTPUT:
GOOD: {"status": "KNOWN", "correction": null, "feedback": null}
GOOD: {"status": "UNKNOWN", "correction": "...", "feedback": "..."}
BAD: [{"status": "UNKNOWN"}, {TAG: {"status": "UNKNOWN"}}] // OR ANYTHING ELSE THAN A SINGLE OBJECT WITH status, correction, feedback

# INSTRUCTIONS
input: two evaluations of a translation. One for the whole translation and one for a specific <PART>.
task: format and articulate the evaluation of the <PART> of speech.

# Notes
If the learner used equivalent alternative vocabulary, then select NEUTRAL. if you are unsure, select NEUTRAL. If the <PART> is missing, then select UNKNOWN.
If you reference the Unit, call it a word.
Dont feedback anything thats expected.

### TRANSLATION
from {{{language.known}}} to {{{language.learning}}}.
original sentence:
"{{{sentence.known}}}"
"{{{sentence.known}}}"

expected translation: (the tag <PART> was added now for your emphasis)
"{{{sentence.learning}}}" 
"{{{sentence.learning}}}" 

user translation:
"{{{sentence.translation}}}"
"{{{sentence.translation}}}"

The <PART> you evaluate now is made up of the word (Unit) "{{part.token}}"
and the Universal Dependencys (Tags) of{{#part.tags}} {{branch}}{{/part.tags}}.

### EVALUATION
of the whole translation:
{{{evaluation.whole}}}

of your specific <PART>:
{{{evaluation.token}}}

`,
};
