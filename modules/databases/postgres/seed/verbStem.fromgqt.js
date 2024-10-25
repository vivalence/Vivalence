// ok i will not build the whole thing here.
// this is a test and will pre populate my db.
// in the end i will make this a intelligent resolver that autocompletes the data when its called.
// this means tho that the system needs to know to expect the data.
// interesting problem. not todays problem

import { ChatGPTAPI } from "chatgpt";
import { PrismaClient } from "@prisma/client";
import { appendToFile, FiniteTenseEnum, getEnding, MoodEnum, NonFiniteTenseEnum, Verbs } from "./lib.js";

const gpt = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
  completionParams: {
    // model: "gpt-3.5-turbo"
    model: "gpt-4",
  },
});

const prisma = new PrismaClient();

const filePath = "./prisma-server/seed/data/verbStems.json";
const LIMIT = 9999991;
const STEP = 6;
let index = 0;

const VerbStems = [];
for (const verb of Verbs) {
  const ending = getEnding(verb);
  for (const tense of NonFiniteTenseEnum) {
    index++;
    if (index > LIMIT) break;

    VerbStems.push({
      verb,
      ending,
      tense,
      mood: "NON_FINITE_MOOD",
    });
  }
  for (const tense of FiniteTenseEnum) {
    for (const mood of MoodEnum) {
      index++;
      if (index > LIMIT) break;
      VerbStems.push({
        verb,
        ending,
        tense,
        mood,
      });
    }
  }
}

const conjugate = async (verb, index) => {
  const systemMessage =
    `Provide the Spanish verb conjugation for stem extraction; no additional information or characters, no "-()/+_" ; just the stem.`;
  const template = `verb: ${verb.verb} | ${verb.ending} | ${verb.tense} | ${verb.mood}`;
  const res = await gpt.sendMessage(template, { systemMessage });
  verb.stem = res.text;
  verb.index = index;
  return verb;
};

console.log("VerbStems", VerbStems.length);

for (let i = 0; i < VerbStems.length; i += STEP) {
  console.log("i", i, "/", VerbStems.length);
  const batch = VerbStems.slice(i, i + STEP);
  const promises = [];
  for (const verb of batch) {
    promises.push(conjugate(verb, index));
  }
  const batchData = await Promise.all(promises);
  await appendToFile(batchData, filePath);

  await new Promise((resolve) => setTimeout(resolve, 2000));
}
