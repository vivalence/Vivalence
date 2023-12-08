import { prisma } from "../../../prisma-client.js";
import { getGPTResponse } from "../../../library/openai-client.js";
import { getNewUnit, getDueUnit, getPrioritizedUnit } from "../../library/getGameUnits.js";

export default async function generate({ gameId, curriculumId, mask }) {
    const practiceSet = await Promise.all([
        getNextInputUnits({ curriculumId, gameId, type: "WORD" }),
        getNextInputUnits({ curriculumId, gameId, type: "CONJUGATION" }),
    ]);
    if (practiceSet.some((item) => !item)) throw new Error("No items to practice now");
    const sentence = await generateSentence({
        inputs: practiceSet,
        learning: "spanish",
        spoken: "english",
    });
    return sentence;
}

async function getNextInputUnits(input) {
    const { curriculumId, gameId, type = "WORD" } = input;
    try {
        const input = {
            curriculumId,
            type,
            gameId,
            now: new Date(),
        };

        const prioritizedUnit = await getPrioritizedUnit(input);
        if (prioritizedUnit) return prioritizedUnit;

        const dueUnit = await getDueUnit(input);
        if (dueUnit) return dueUnit;

        const newUnit = await getNewUnit(input);
        if (newUnit) return newUnit;

        console.log("No items to practice now");
        return null;
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
}

async function generateSentence({ inputs, learning, spoken }) {
    try {
        const prompt = `
You are generating language learning material for a user learning ${learning}
Using the following constraints:
generate a sentence in ${spoken}
and its translation in ${learning}:

Words to be used in ${spoken}:
${inputs.map((w) => w.data[spoken]).join(", ")}

Words to be used in ${learning}:
${inputs.map((w) => w.data[learning]).join(", ")}

return this structure/format:
{
  "sentenceSpoken": "String",
  "sentenceLearning": "String"
}

dont use words more advanced than those provided.
Generate very simple sentences.
`;
        let sentence = null;
        return {
            sentenceSpoken: "This year is going to be great.",
            sentenceLearning: "Este año va a ser genial.",
        };

        let index = 0;
        while (!sentence && index < 3) {
            index++;
            console.log("index", index);
            sentence = await getGPTResponse([prompt]);
            if (!(await verifySentence(sentence))) sentence = null;
        }
        return { spoken: sentence.sentenceSpoken, learning: sentence.sentenceLearning };
    } catch (error) {
        console.error("Error in generateSentences:", error);
        throw error;
    }
}
async function verifySentence(sentence) {
    console.log("verify sentence", sentence);
    return true;
}

// curriculum: clpl75uu00000g0mwkivlcucv
// game: clpr5668n0000g01pvnkghden
// await generate({ curriculumId: "clpl75uu00000g0mwkivlcucv", gameId: "clpr5668n0000g01pvnkghden" });

// Grammar - Verb: ${constraints.grammar.verb},
// Tense: ${constraints.grammar.tense},
// Performer: ${constraints.grammar.performer},
// Mood: ${constraints.grammar.mood}
