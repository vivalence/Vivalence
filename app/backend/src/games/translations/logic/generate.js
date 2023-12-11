import Mustache from "mustache";
import { prisma } from "../../../prisma-client.js";
import { getGPTResponse } from "../../../library/openai-client.js";
import { getUnits } from "../../library/gameUnits.js";
import { log } from "../../../library/logging.js";

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
        mask,
    });
    return sentence;
}

async function generateSentence(inputs) {
    try {
        const prompt = Mustache.render(inputs.mask.data.generate.prompt, inputs);
        const model = "gpt-4-1106-preview"; // "gpt-3.5-turbo-1106"

        const start = Date.now();
        const sentence = await getGPTResponse({ prompt: [prompt], model });
        const duration = (Date.now() - start) / 1000;
        log(
            "generateSentence",
            { prompt, input: inputs, response: sentence, duration, model },
            "foreign",
        );

        // let index = 0; while (!sentence && index < 3) {index++; console.log("index", index); sentence = await getGPTResponse({ prompt: [prompt] }); if (!(await verifySentence(sentence))) sentence = null;}
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
