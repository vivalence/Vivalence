import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const mask = {
    language: { learning: "spanish", spoken: "english" },
    tags: ["NOUN", "VERB", "ADJECTIVE"],
    provider: {
        // api: "openai", model: "gpt-4-1106-preview",
        api: "anyscale",
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    },
    generate: {
        // provider: {api: "openai", model: "gpt-4-1106-preview",},
        prompt: {
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
                },
                required: ["spoken", "learning"],
            },
            template: `### Instructions
You Generate a sentence in {{language.spoken}} and its translation in {{language.learning}} as language learning material for a user learning {{language.learning}}.

Follow this strategy: Basic Descriptive Sentences
   - Part of Speech Combination: NOUN + VERB + ADJ (varying order)
   - Focus: The learner should practice forming sentences with a subject (NOUN), a simple action (VERB in present tense), and a descriptor (ADJ).
   - Examples:
        "El gato (NOUN) es (VERB) pequeño (ADJ)." (The cat is small.)
        "Los perros (NOUN) corren (VERB) rápidos (ADJ)." (The dogs run fast.)
        "La sopa (NOUN) huele (VERB) deliciosa (ADJ)." (The soup smells delicious.)

Don't use words more advanced than those provided. We want the learner to be successfull.
Keep the sentence between 3-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.

### Task
language spoken: {{language.spoken}}; learning: {{language.learning}};

Select from among these words:
{{#units}}
{{learning}} {{spoken}} {{#tags}}{{.}} {{/tags}}
{{/units}}

Return a JSON object with the spoken and learning sentence.`,
        },
        run: async function (inputs, primitives, context) {
            const { gameId, curriculumId, blacklist } = inputs;
            const { getUnits, createLLMClient, nlp } = primitives;
            const { tags, language, provider, prompt } = context.mask;

            const llm = await createLLMClient({ provider, prompt });

            const units = (
                await Promise.all(
                    tags.map((tag) =>
                        getUnits({ blacklist, curriculumId, gameId, take: 4, tags: [tag] }),
                    ),
                )
            )
                .flat()
                .map((input) => ({
                    learning: input.data[language.learning],
                    spoken: input.data[language.spoken],
                    tags: input.tags.map(({ name }) => name),
                }));

            if (units.filter((item) => !!item).length < 5)
                throw new Error("Not enough items to practice");

            const sentences = await llm({ units, language });
            const analysis = await nlp(sentences.learning, { findUnits: true });
            sentences.payload = { pos: analysis };
            return sentences;
        }.toString(),
    },
    evaluate: {
        prompt: {
            schema: {
                title: "Evaluations",
                type: "object",
                properties: {
                    evaluation: {
                        title: "Evaluation",
                        description: `KNOWN means the learner successfully used this part of speech in their translation as expected. UNKNOWN means the learner failed in their use the expected part of speech. Spelling, missing words, and other errors are considered UNKNOWN. NEUTRAL is to be used only if the learner applied an equivalent alternative successfully. If the PoS is not present in the translation, then it is UNKNOWN.`,
                        enum: ["KNOWN", "UNKNOWN", "NEUTRAL"],
                        type: "string",
                    },
                },
                required: ["evaluation"],
            },
            template: `Evaluate this part of speech of a translated sentence.
The sentence was translated from {{language.spoken}} to {{language.learning}} by a language learner as a learning exercise.

Prompted {{language.spoken}} sentence:
{{sentence.spoken}}

Expected {{language.learning}} translation: (this was hidden from the learner)
{{sentence.learning}}

Learner provided translation:
{{sentence.translation}}

You provide an evaluation on the successful usage of this part of speech as KNOWN or UNKNOWN.
The Part of Speech you are evaluating is:
{{language.spoken}}: {{part.spoken}}
{{language.learning}}: {{part.learning}}
upos: {{part.upos}}
feats: {{part.feats}}

Did the learner correctly use this part of speech? evaluate only the part of speech. not the whole sentence.
`,
        },
        run: (async (inputs, primitives, context) => {
            const { gameId, curriculumId, payload, sentence } = inputs;
            const { prisma, nlp, createLLMClient, handleGameUpdate } = primitives;
            const { language, provider, prompt } = context.mask;

            const llm = await createLLMClient({ provider, prompt });

            const PoS = payload.pos.filter((pos) => pos.unit);
            console.log(`[expected] ${sentence.learning} [translation] ${sentence.translation}`);

            const promises = PoS.map(async (pos, i) => {
                const part = {
                    spoken: pos.unit.data[language.spoken],
                    learning: pos.unit.data[language.learning],
                    upos: pos.upos,
                    feats: pos.feats.STRING.replace(/\=/g, ":"),
                };
                const response = await llm({ language, sentence, part });
                console.log(response.evaluation, part.spoken, part.learning);
                if (response.evaluation !== "NEUTRAL")
                    await handleGameUpdate({
                        gameId,
                        unitId: pos.unit.id,
                        response: response.evaluation,
                        gameType: "TRANSLATIONS",
                    });
            });

            return await Promise.all(promises);
        }).toString(),
    },
    feedback: {
        // provider: {api: "openai", model: "gpt-4-1106-preview",},
        prompts: {
            parts: {
                schema: {
                    title: "Feedback on a Part of Speech",
                    type: "object",
                    properties: {
                        part: {
                            title: "the Part of Speech",
                            description:
                                "the referenced PoS. in the language to be learned. Taken from the expected translation! single word. only the PoS.",
                            type: "string",
                        },
                        translation: {
                            title: "PoS Learners Translation",
                            description:
                                "The original translation of this PoS by the learner. Taken from the learner's translation! single word. only the PoS.",
                            type: "string",
                        },
                        correction: {
                            title: "Correction",
                            description:
                                "if learner made a mistake, provide what the learner should have written. Taken from the expected translation! single word. only the PoS. optional.",
                            type: "string",
                        },
                        classification: {
                            title: "FeedbackEnum",
                            description:
                                `This enumeration assesses the learner's use of the specific part of speech (PoS) in the translation.` +
                                `'correct' signifies accurate usage of the PoS.` +
                                `'info' applies when non-standard usage still conveys the intended meaning, reflecting stylistic or creative choices.` +
                                `'mistake' denotes minor errors like punctuation, apostrophes, spelling, or typos, not affecting clarity or grammar.` +
                                `'failure' indicates false use or omission of the PoS.`,
                            enum: ["correct", "info", "mistake", "failure"],
                            type: "string",
                        },
                    },
                    required: ["part", "translation", "classification"],
                },
                template: `### Instructions
You provide feedback on a specific Part of Speech (PoS) of a translation. the translation was created as a learning exercise. The user is familiar with {{language.spoken}} and is learning {{language.learning}}. Respond in JSON. 
Ignore capitalization.
Assess the correctness of the PoS. reference only the PoS. Not the sentence.
Include a correction, translation, and classification. 

### Task:
PoS you are evaluating:
{{language.spoken}}: {{part.spoken}}
{{language.learning}}: {{part.learning}}
upos: {{part.upos}}
start - end character: {{part.start}} - {{part.end}}

Prompted {{language.spoken}} sentence:
{{sentence.spoken}}

Expected {{language.learning}} translation: (this was hidden from the user)
{{sentence.learning}}

Learner provided translation:
{{sentence.translation}}

`,
            },
            overall: {
                schema: {
                    title: "Feedback on whole Translation",
                    type: "object",
                    properties: {
                        correction: { title: "Correction", type: "string" },
                        score: { title: "Score", minimum: 0.0, maximum: 1.0, type: "number" },
                        classification: { $ref: "#/definitions/FeedbackEnum" },
                        summary: {
                            title: "Summary",
                            description:
                                "Human readable feedback for the learner in the form of a few short and concise sentences. Meant to be displayed to the learner, such that they can improve their translation.",
                            type: "string",
                        },
                    },
                    required: ["correction", "score", "classification", "summary"],
                    definitions: {
                        FeedbackEnum: {
                            title: "FeedbackEnum",
                            description: "an enumeration of this sentences' correctness.",
                            enum: ["correct", "info", "mistake", "failure"],
                            type: "string",
                        },
                    },
                },
                template: `### Instructions
You provide feedback on a translation, which was created as a learning exercise. Assess the overall quality of the translation. Include a score and classification. The user is familiar with {{language.spoken}} and is learning {{language.learning}}. Respond in JSON. 

### Example
input 
learning: Él hace comida deliciosa todos los días
spoken: He makes delicious food every day
translation: el hace delicioso cada día

response 
correction: "Él hace comida deliciosa todos los días"
score: 0.4
classification: "failure"
summary: "You missed the noun 'food' ('comida') and used 'delicioso' instead of 'deliciosa', which should agree in gender with 'comida'. Additionally, 'todos los días' is a more common translation for 'every day' then 'cada día'."

### Task:
Prompted {{language.spoken}} sentence:
{{sentence.spoken}}

Expected {{language.learning}} translation: (this was hidden from the user)
{{sentence.learning}}

Learner provided translation:
{{sentence.translation}}`,
            },
        },
        run: async function (inputs, primitives, context) {
            const { gameId, curriculumId, payload, sentence } = inputs;
            const { createLLMClient } = primitives;
            const { language, provider, prompts } = context.mask;

            const overall = await createLLMClient({ provider, prompt: prompts.overall });
            const parts = await createLLMClient({ provider, prompt: prompts.parts });

            const PoS = payload.pos.filter((pos) => pos.unit);

            const promises = PoS.map(async (pos, i) => {
                const part = await parts({
                    language,
                    sentence,
                    part: {
                        spoken: pos.unit.data[language.spoken],
                        learning: pos.unit.data[language.learning],
                        feats: pos.feats.STRING.replace(/\=/g, ":"),
                        upos: pos["upos"],
                        start: pos["start_char"],
                        end: pos["end_char"],
                    },
                });
                part.part = pos.text;
                return part;
            });

            const response = await overall({ language, sentence });
            response.parts = await Promise.all(promises);
            return response;
        }.toString(),
    },
};

async function update() {
    const where = { id: "clpr5668n0002g01pnxhkh8nf" };
    const data = { data: mask };
    const update = await prisma.mask.update({ where, data });
}

await update();
