const prompt = {
    schema: {
        title: "LanguageLearningSentence",
        type: "object",
        properties: {
            spoken: {
                title: "SpokenSentence",
                description: "Sentence in the familiar language",
                type: "string"
            },
            learning: {
                title: "LearningSentence",
                description: "Sentence in the language to be learned",
                type: "string"
            }
        },
        required: ["spoken", "learning"]
    },
    template: `### Instructions
You Generate a sentence in {{language.spoken}} and its translation in {{language.learning}} as language learning material for a user learning {{language.learning}}.

Follow this strategy:
${innerPrompt}

Don't use words more advanced than those provided. We want the learner to be successfull.
Keep the sentence between 3-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.

### Task
generate a sentence in {{language.learning}} (learning) and its translation in {{language.spoken}} (spoken).

build the sentence using these words:
{{#units}}
{{learning}} {{spoken}}
{{/units}}

Return a JSON object with the spoken and learning sentence.`
};

export default async function (inputs, { supabase }) {
    // const run = async function (inputs, primitives, context) {
    // const { gameId, curriculumId, blacklist } = inputs;
    // const { getUnits, createLLMClient, nlp } = primitives;
    // const { tags, language, provider, prompt } = context.mask;

    const llm = await createLLMClient({ provider, prompt });

    const units = (
        await Promise.all(
            tags.map((tag) => getUnits({ blacklist, curriculumId, gameId, take: 4, tags: [tag] }))
        )
    )
        .flat()
        .map((input) => ({
            learning: input.data[language.learning],
            spoken: input.data[language.spoken],
            tags: input.tags.map(({ name }) => name)
        }));

    if (units.filter((item) => !!item).length < 5) throw new Error("Not enough items to practice");

    const sentences = await llm({ units, language });
    const analysis = await nlp(sentences.learning, { findUnits: true });
    sentences.payload = { pos: analysis.sentences[0].tokens };
    return sentences;
}
