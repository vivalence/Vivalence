import Mustache from "mustache";

export default async function fromLLM(inputs, ctx) {
  const { scope, concept } = inputs;

  const prompt = Mustache.render(Prompt.template, {
    concept,
    language: ctx.runtime.statics.language,
  });

  const input = { prompt, schema: Prompt.schema, provider: Prompt.provider };
  const instruction = await ctx.runtime.services.llm(input);
  return [{ instruction, scope }];
}

const provisionProvider = {
  api: "anthropic",
  model: "claude-3-5-sonnet-latest",
  temperature: 0.7,
  max_tokens: 300,
};
export const Prompt = {
  provider: provisionProvider,
  schema: {
    title: "GrammaticalConceptFlashcard",
    type: "object",
    properties: {
      front: {
        type: "object",
        properties: {
          header: {
            type: ["string", "null"],
            description: "Clear question about the grammatical concept",
          },
          content: {
            type: ["string", "null"],
            description:
              "Concept explanation with practical examples in parentheses, using HTML for emphasis",
          },
          footer: {
            type: ["string", "null"],
            description:
              "Optional specific signal, pattern, or context that helps identify when or where this grammatical concept applies",
          },
        },
        required: ["header", "content", "footer"],
      },
      back: {
        type: "object",
        properties: {
          header: {
            type: ["string", "null"],
            description: "The correct answer",
          },
          content: {
            type: ["string", "null"],
            description: "Grammatical explanation in target language, using HTML for emphasis",
          },
          footer: {
            type: ["string", "null"],
            description:
              "Optional technical detail about formation, usage, or limitation that's crucial for correct application",
          },
        },
        required: ["header", "content", "footer"],
      },
    },
    required: ["front", "back"],
  },
  template: `### Example outputs:
{
 "front": {
   "header": "What case is used for:",
   "content": "<i>indirect objects</i> receiving an action",
   "footer": "like: giving a book to someone"
 },
 "back": {
   "header": "Dativ",
   "content": "Der Dativ bezeichnet den <b>Empfänger</b> einer Handlung",
   "footer": null
 }
}

{
 "front": {
   "header": "What verb aspect shows:",
   "content": "single completed action in the past",
   "footer": null
 },
 "back": {
   "header": "совершенный вид",
   "content": "глагол совершенного вида, обозначающий завершённое действие",
   "footer": "часто образуется с помощью приставок про-/по-"
 }
}

### Instructions
You are an expert language teacher creating flashcards to teach grammatical concepts.
Generate a flashcard that tests the learner's understanding of the provided grammatical concept.
Use HTML tags (<i>, <b>, <em>) to emphasize key terms and distinctions.
The language learner is going from {{{language.known}}} to {{{language.learning}}}.

<CONCEPT>
{{concept}}
</CONCEPT>

Guidelines:
1. Front header must frame this as a clear question about what the grammatical concept marks/shows/indicates
2. Front content must include technical terms 
3. Back header must show the correct form/answer
4. Back content must give the grammatical explanation in the target language
5. All explanations must be clear enough for a language learner to understand
6. Examples should use common, basic vocabulary
7. Use footers optionally when they provide distinct value through identifying signals or crucial application details or practical examples
8. Use HTML tags to highlight key terms and important distinctions
9. Don't give away the answer in the front (DONT EVER NEVER EVER DO THIS!!!)
`,
};
