import Mustache from "mustache";
import { prisma } from "../../../prisma-client.js";
import { getGPTResponse } from "../../../library/openai-client.js";
import { getUnits } from "../../library/gameUnits.js";

export default async function generate({ gameId, curriculumId, mask }) {
    const getterInput = {
        curriculumId,
        gameId,
        take: 3,
    };
    const conjugation = (
        await getUnits({
            ...getterInput,
            tags: ["VERB_CONJUGATION"],
            take: 1,
        })
    ).shift();
    if (!conjugation) throw new Error("No conjugation to practice now");

    let units = (
        await Promise.all([
            [conjugation],
            getUnits({ ...getterInput, tags: ["NOUN"] }),
            getUnits({ ...getterInput, tags: ["ADJECTIVE"] }),
            getUnits({ ...getterInput, tags: ["ADPOSITION"] }),
            getUnits({ ...getterInput, tags: ["ADVERB"] }),
            getUnits({ ...getterInput, tags: ["PRONOUN"] }),
        ])
    ).flat();

    if (units.filter((item) => !!item).length < 5) throw new Error("Not enough items to practice");

    const learning = "spanish";
    const spoken = "english";

    units = units.map((input) => ({
        id: input.id,
        word: { learning: input.data[learning], spoken: input.data[spoken] },
        tags: input.tags.map(({ name }) => name),
    }));

    const constraints = {
        tense: conjugation.data.tense,
        mood: conjugation.data.mood,
        performer: conjugation.data.performer,
    };

    const sentence = await generateSentence({
        units,
        language: { learning, spoken },
        constraints,
    });
    return sentence;
}

function makePrompt(input) {
    // template should be a mask property
    const promptTemplate = `
You are generating language learning material for a user learning {{language.learning}}.
Using the following constraints generate a sentence in {{language.spoken}} and its translation in {{language.learning}}:

Tense: {{constraints.tense}},
mood: {{constraints.mood}},
performer: {{constraints.performer}},

Select from among these words:
{{#units}}
{ id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}", tags: [ {{#tags}}{{.}}, {{/tags}}] },
{{/units}}

Return the following JSON structure:
{
  "spoken": "Sentence in {{language.spoken}}",
  "learning": "Sentence in {{language.learning}}",
  "ids": ["ID", ...], // the ids of the words used to generate the sentence. One-to-one correspondence is required.
}

Don't use words more advanced than those provided. We want the learner to be successfull. Keep the sentence between 4-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.`;
    // the learner is at level {{level}}.
    const prompt = Mustache.render(promptTemplate, input);
    return prompt;
}

async function generateSentence(inputs) {
    try {
        const prompt = makePrompt(inputs);
        const sentence = await getGPTResponse({ prompt: [prompt] });

        // let index = 0;
        // while (!sentence && index < 3) {
        //     index++;
        //     console.log("index", index);
        //     sentence = await getGPTResponse({ prompt: [prompt] });
        //     if (!(await verifySentence(sentence))) sentence = null;
        // }
        return { spoken: sentence.spoken, learning: sentence.learning, ids: sentence.ids };
    } catch (error) {
        console.error("Error in generateSentences:", error);
        throw error;
    }
}

async function verifySentence(sentence) {
    // console.log("verify sentence", sentence);
    return true;
}

// await generate({ curriculumId: "clpl75uu00000g0mwkivlcucv", gameId: "clpr5668n0000g01pvnkghden" });
