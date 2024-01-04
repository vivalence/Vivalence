import { prisma } from "../../../prisma-client.js";

const mask = {
    language: { learning: "spanish", spoken: "english" },
    tags: ["NOUN", "VERB", "ADJECTIVE"],
    api: "openai",
    model: "gpt-4-1106-preview",
    // api: "anyscale", model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    evaluate: {
        schema: {
            title: "Evaluations",
            type: "object",
            properties: {
                evaluations: {
                    title: "Evaluations",
                    type: "array",
                    items: {
                        $ref: "#/definitions/Evaluation",
                    },
                },
            },
            required: ["evaluations"],
            definitions: {
                EvaluationEnum: {
                    title: "EvaluationEnum",
                    description:
                        "Does the user know to correctly apply this part of speech? Classified as either KNOWN or UNKNOWN.",
                    enum: ["KNOWN", "UNKNOWN"],
                    type: "string",
                },
                Evaluation: {
                    title: "Evaluation",
                    type: "object",
                    properties: {
                        id: {
                            title: "ID",
                            type: "string",
                        },
                        evaluation: {
                            $ref: "#/definitions/EvaluationEnum",
                        },
                    },
                    required: ["id", "evaluation"],
                },
            },
        },
        prompt: {
            text: `A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.
You provide a technical evaluation on the successfull usage of specific words.

Respond in JSON format. Example:
"""
input {
    learning: "Haber un año",
    spoken: "To have a year",
    translation: "tener un año",
    words: [
	{"id": 2A, "spoken": "to have", "learning": "haber"},
	{"id": 3B, "spoken": "thing", "learning": "cosa"},
	{"id": 4C, "spoken": "year", "learning": "año"}
    ]
}
return {
    evaluations: [ 
        { id: "2A", evaluation: "UNKNOWN" },
        { id: "4C", evaluation: "KNOWN" },
    ]
}
"""

Evaluation:
Evaluate whether the usage of these words as either KNOWN or UNKNOWN, as measured by the learners successful usage of the word in context, given the prompt and expected translation.
Only provide evaluations for words that were part of the prompted sentence. Exclude words that were not part of the prompted sentenc.

The learner was prompted with this sentence:
{{{sentence.spoken}}}

The learner has provided this translation:
{{sentence.translation}}

This was the originially intended translation, but the learner never saw it:
{{sentence.learning}}

spoken: {{language.spoken}}; learning: {{language.learning}};
The sentence was generated from these words:
{{#units}}
{{.}}
{{/units}}
`,
        },
        run: (async (inputs, primitives, context) => {
            const { gameId, curriculumId, payload, sentence } = inputs;
            const { validate, template, llm, getUnits, handleGameUpdate } = primitives;
            const { language } = context.mask;

            const units = await getUnits({
                gameId,
                curriculumId,
                whitelist: payload.ids,
                take: payload.ids.length,
            });

            const promptInputs = {
                language,
                sentence,
                units: units.map((unit) =>
                    JSON.stringify({
                        id: unit.id,
                        learning: unit.data[language.learning],
                        spoken: unit.data[language.spoken],
                    }),
                ),
            };
            const renderedPrompt = template(promptInputs);
            const response = await llm(renderedPrompt);

            const promises = [];
            for (const evaluation of response.evaluations) {
                // validate evaluation
                promises.push(
                    handleGameUpdate({
                        gameId,
                        unitId: evaluation.id,
                        response: evaluation.evaluation,
                        gameType: "TRANSLATIONS",
                    }),
                );
            }
            await Promise.all(promises);
            return response;
        }).toString(),
    },
    feedback: {
        prompt: {
            text: `A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise.
You provide feedback on the translation for the user. Assess each part-of-speech (PoS) and the overall quality of the translation. Include a score and classification for both individual parts and the entire sentence.

Respond in JSON format. Example:
"""input {
    learning: "Él hace comida deliciosa todos los días",
    spoken: "He makes delicious food every day",
    translation: "el hace delicioso cada día",
}
return {
  feedback: {
    parts: [
      { part: "Él", translation: "el", correction: "Él", classification: "info" },
      { part: "hace", translation: "hace", classification: "correct" },
      { part: "comida", translation: "", correction: "comida", classification: "failure" },
      { part: "deliciosa", translation: "delicioso", correction: "deliciosa", classification: "mistake" },
      { part: "todos los días", translation: "cada día", correction: "todos los días", classification: "info" }
    ],
    correction: "Él hace comida deliciosa todos los días",
    score: 0.4,
    classification: "failure",
    summary: "You missed the noun 'food' ('comida') and used 'delicioso' instead of 'deliciosa', which should agree in gender with 'comida'. Additionally, 'todos los días' is a more common translation for 'every day' then 'cada día'."
  }
}"""

Feedback:
The learner was prompted with this sentence:
{{{sentence.spoken}}}

The learner has provided this translation:
{{sentence.translation}}

This was the originially intended translation, but the learner never saw it:
{{sentence.learning}}`,
        },
        schema: {
            title: "Feedback",
            type: "object",
            properties: {
                parts: {
                    title: "Parts",
                    type: "array",
                    items: {
                        $ref: "#/definitions/Part",
                    },
                },
                correction: {
                    title: "Correction",
                    type: "string",
                },
                score: {
                    title: "Score",
                    minimum: 0.0,
                    maximum: 1.0,
                    type: "number",
                },
                classification: {
                    $ref: "#/definitions/FeedbackEnum",
                },
                summary: {
                    title: "Summary",
                    description:
                        "Human readable feedback for the learner in the form of a few short and concise sentences. Meant to be displayed to the learner, such that they can improve their translation.",
                    type: "string",
                },
            },
            required: ["parts", "score", "classification", "summary"],
            definitions: {
                FeedbackEnum: {
                    title: "FeedbackEnum",
                    description: "An enumeration.",
                    enum: ["correct", "info", "mistake", "failure"],
                    type: "string",
                },
                Part: {
                    title: "Part",
                    type: "object",
                    properties: {
                        part: {
                            title: "Part",
                            type: "string",
                        },
                        correction: {
                            title: "Correction",
                            type: "string",
                        },
                        translation: {
                            title: "Translation",
                            type: "string",
                        },
                        classification: {
                            $ref: "#/definitions/FeedbackEnum",
                        },
                    },
                    required: ["part", "translation", "classification"],
                },
            },
        },
        run: (async (inputs, primitives, context) => {
            const { gameId, curriculumId, payload, sentence } = inputs;
            const { validate, template, llm, getUnits } = primitives;
            const { language } = context.mask;

            const units = await getUnits({
                gameId,
                curriculumId,
                whitelist: payload.ids,
                take: payload.ids.length,
            });

            const promptInputs = {
                language,
                sentence,
                units: units.map((unit) => ({
                    id: unit.id,
                    learning: unit.data[language.learning],
                    spoken: unit.data[language.spoken],
                })),
            };
            const renderedPrompt = template(promptInputs);
            const response = await llm(renderedPrompt);
            return response;
        }).toString(),
    },
    generate: {
        prompt: {
            text: `You Generate a sentence in {{language.spoken}} and its translation in {{language.learning}} as language learning material for a user learning {{language.learning}}.

Follow this strategy: Basic Descriptive Sentences
   - POS Combination: NOUN + VERB + ADJ
   - Focus: Practice forming sentences with a subject (NOUN), a simple action (VERB in present tense), and a descriptor (ADJ).
   - Example: "El gato (NOUN) es (VERB) pequeño (ADJ)." (The cat is small.)

Don't use words more advanced than those provided. We want the learner to be successfull.
Keep the sentence between 3-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.

language spoken: {{language.spoken}}; learning: {{language.learning}};

Select from among these words:
{{#units}}
{{.}}
{{/units}}

Return a JSON object with the spoken and learning sentence, as well as the list of ids used to generate the sentence. exclude any words that were not used to generate the sentence.`,
        },
        schema: {
            title: "LanguageLearningSentence",
            type: "object",
            properties: {
                spoken: {
                    title: "SpokenSentence",
                    description: "Sentence in the familiar language",
                    type: "string",
                },
                learning: {
                    title: "LearningSentence",
                    description: "Sentence in the language to be learned",
                    type: "string",
                },
                ids: {
                    title: "Ids",
                    description:
                        "List of IDs corresponding to the words used to generate the sentence",
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
            },
            required: ["spoken", "learning", "ids"],
        },
        run: (async (inputs, primitives, context) => {
            const { gameId, curriculumId } = inputs;
            const { validate, getUnits, template, llm } = primitives;
            const { tags, language } = context.mask;

            const units = (
                await Promise.all(
                    tags.map((tag) => getUnits({ curriculumId, gameId, take: 3, tags: [tag] })),
                )
            )
                .flat()
                .map((input) =>
                    JSON.stringify({
                        id: input.id,
                        learning: input.data[language.learning],
                        spoken: input.data[language.spoken],
                        tags: input.tags.map(({ name }) => name),
                    }),
                );

            if (units.filter((item) => !!item).length < 5)
                throw new Error("Not enough items to practice");

            const renderedPrompt = template({ units, language });
            const sentences = await llm(renderedPrompt);
            return sentences;
        }).toString(),
    },
};

async function update() {
    const where = { id: "clpr5668n0002g01pnxhkh8nf" };
    const data = { data: mask };
    const update = await prisma.mask.update({ where, data });
}

await update();
