import { ChatGPTAPI } from "chatgpt";
import { PrismaClient } from "@prisma/client";
import {
    Verbs,
    NonFiniteTenseEnum,
    FiniteTenseEnum,
    PerformerEnum,
    MoodEnum,
    appendToFile,
    getEnding
} from "./lib.js";

const gpt = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
    completionParams: {
        // model: "gpt-3.5-turbo"
        model: "gpt-4"
    }
});

const prisma = new PrismaClient();

const filePath = "./prisma-server/seed/data/verbEndings.json";
const LIMIT = 99999991;
const STEP = 6;
let index = 0;

const VerbEndings = [];
for (const verb of Verbs) {
    const ending = getEnding(verb);
    for (const tense of NonFiniteTenseEnum) {
        index++;
        if (index > LIMIT) break;

        VerbEndings.push({
            verb,
            ending,
            tense,
            mood: "NON_FINITE_MOOD",
            performer: "NON_FINITE_PERFORMER"
        });
    }
    for (const tense of FiniteTenseEnum) {
        for (const performer of PerformerEnum) {
            for (const mood of MoodEnum) {
                index++;
                if (index > LIMIT) break;
                VerbEndings.push({
                    verb,
                    ending,
                    tense,
                    mood,
                    performer
                });
            }
        }
    }
}

const conjugate = async (verb, index) => {
    const systemMessage = `Provide the Spanish verb conjugation for ending extraction; no additional information or characters, no "-()/+_" ; just the end.`;
    const template = `${verb.verb} | ${verb.ending} | ${verb.tense} | ${verb.mood} | ${verb.performer}`;
    const res = await gpt.sendMessage(template, { systemMessage });
    verb.ending = res.text;
    verb.index = index;
    return verb;
};

console.log("VerbEndings", VerbEndings.length);

for (let i = 0; i < VerbEndings.length; i += STEP) {
    console.log("i", i, "/", VerbEndings.length);
    const batch = VerbEndings.slice(i, i + STEP);
    const promises = [];
    for (const verb of batch) {
        promises.push(conjugate(verb, index));
    }
    const batchData = await Promise.all(promises);
    await appendToFile(batchData, filePath);

    await new Promise((resolve) => setTimeout(resolve, 2000));
}
