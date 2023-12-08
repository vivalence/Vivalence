import { prisma } from "../../../prisma-client.js";
import { getGPTResponse } from "../../../library/openai-client.js";
import { getNewUnit, getDueUnit, getPrioritizedUnit } from "../../library/getGameUnits.js";

// i need
// grammar ie
// performer
// tense
// conjugations

// i want
// pronouns
// nouns
// adverbs
// adjectives

export default async function generate({}) {
    const curriculumId = "clpl75uu00000g0mwkivlcucv";
    const gameId = "clpr5668n0000g01pvnkghden";
    const practiceSet = await Promise.all([
        getNextInputUnits({
            gameId,
            curriculumId,
            tags: ["NOUN"],
            take: 2,
            skip: 15,
        }),
    ]);
    console.log("practiceSet", practiceSet);
    // console.log("practiceSet", practiceSet);
    // if (practiceSet.some((item) => !item)) throw new Error("No items to practice now");
    // const sentence = await generateSentence({inputs: practiceSet.flat(), learning: "spanish", spoken: "english", constraints: { ...grammar },});
    // return sentence;
}
//
async function getNextInputUnits(input) {
    console.log("getNextInputUnits", input);
    const { gameId, curriculumId, tags, take, skip } = input;
    const test = await prisma.curriculumUnitRelation.findMany({
        where: {
            curriculumId,
            unit: {
                unitType: "WORD",
            },
            AND: tags.map((tag) => ({ unit: { tags: { some: { name: tag } } } })),
        },
        take: 5,
        include: { unit: { include: { tags: { select: { name: true } } } } },
    });
    console.log(JSON.stringify(test, null, 2));
    return;
    try {
        // const curriculum = await prisma.curriculum.findMany({where: {id: curriculumId,}, include: {unitRelations: {where: {unit: whereUnit,}, include: {unit: includeUnit,}, orderBy: orderByUnitRelation, take: take, skip: skip,},},});
        // const units = await prisma.unit.findMany({where: {curriculumRelations: {some: {curriculumId,},}, AND: [{ tags: { some: { name: "VERB_CONJUGATION" } } }, { tags: { some: { name: "VERB_FORM_PRESENTE" } } }, { tags: { some: { name: "VERB_ENDING_AR" } } },],}, include: {curriculumRelations: {where: { curriculumId }, orderBy: { index: "asc" },},}, take: 1,});

        // for new units
        const result = await prisma.curriculumUnitRelation.findMany({
            where: {
                curriculumId,
                AND: tags.map((tag) => ({ unit: { tags: { some: { name: tag } } } })),
                unit: { gameRelations: { none: { gameId } } },
            },
            include: {
                unit: { include: { gameRelations: true, tags: { select: { name: true } } } },
            },
            orderBy: { index: "asc" },
            take: take,
        });
        // for currently playing units
        // const result = await prisma.gameUnitRelation.findMany({where: {gameId, AND: [{ unit: { tags: { some: { name: "ADJECTIVE" } } } }], unit: {curriculumRelations: {some: {curriculumId,},},},}, include: {unit: {include: {curriculumRelations: true, tags: {select: { name: true },},},},}, orderBy: { nextPlay: "asc" }, take: 1,});
        console.log("result", result);

        return result.map((item) => item.unit);
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
}

async function generateSentence(input) {
    const { inputs, learning, spoken, level = "A2", constraints } = input;
    try {
        const prompt = `
You are generating language learning material for a user learning ${learning}.
Using the following constraints generate a sentence in ${spoken} and its translation in ${learning}:

Tense: ${constraints.tense},
mood: ${constraints.mood},
performer: ${constraints.performer},

Select from among these words:
${JSON.stringify(inputs)}

Return the following JSON format:
{
  "spoken": "Sentence in ${spoken}",
  "learning": "Sentence in ${learning}",
  "ids": ["ID", ...], // the ids of the words used to generate the sentence. One-to-one correspondence is required.
}

dont use words more advanced than those provided.
the learner is at level ${level}. keep the sentence at 3-6 words.
`;
        console.log("prompt", prompt);
        let sentence = null;

        sentence = await getGPTResponse({ prompt: [prompt] });
        // return {sentenceSpoken: "This year is going to be great.", sentenceLearning: "Este año va a ser genial.",};
        // let index = 0;
        // while (!sentence && index < 3) {
        //     index++;
        //     console.log("index", index);
        //     sentence = await getGPTResponse([prompt]);
        //     if (!(await verifySentence(sentence))) sentence = null;
        // }
        console.log("sentence", sentence);

        return {
            spoken: sentence.spoken,
            learning: sentence.learning,
            usedIds: sentence.ids,
        };
    } catch (error) {
        console.error("Error in generateSentences:", error);
        throw error;
    }
}
async function verifySentence(sentence) {
    console.log("verify sentence", sentence);
    return true;
}

await generate({});

// curriculum: clpl75uu00000g0mwkivlcucv
// game: clpr5668n0000g01pvnkghden
// await generate({ curriculumId: "clpl75uu00000g0mwkivlcucv", gameId: "clpr5668n0000g01pvnkghden" });

// Grammar - Verb: ${constraints.grammar.verb},
// Tense: ${constraints.grammar.tense},
// Performer: ${constraints.grammar.performer},
// Mood: ${constraints.grammar.mood}
