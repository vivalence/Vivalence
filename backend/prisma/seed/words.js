import { PrismaClient } from "@prisma/client";
import wordsData from "./words.json";

const prisma = new PrismaClient();

async function main() {
    for (const word of wordsData) {
        try {
            const data = {
                index: parseInt(word.index),
                spanish: word.spanish,
                english: word.english,
                type: word.type_enums.toUpperCase(),
                usageInSpanish: word.used_spanish,
                usageInEnglish: word.used_english,
                data: word
            };
            // console.log("word", word, data);
            const update = await prisma.word.updateMany({
                where: { index: data.index },
                data
            });
            // console.log("update", update);
            // const words = await prisma.word.findMany();
            // console.log("words", words);
        } catch (e) {
            console.error("[error]", e);
        }
    }
}

// await prisma.word.deleteMany();
await main();

// # top 100 verbs
const words = await prisma.word.findMany({
    // orderBy: { index: "asc" },
    // where: { type: "V" },
    // take: 25,
});

console.log("words", words.length);

// async function tmp() {
//   // const data = [1, 2, 3, 4, 5];
//   const data = [1, 2];

//   for (const item of data) {
//     const result = await someAsyncFunction(item);
//     console.log(result);
//   }
// }

// async function someAsyncFunction(item) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(`Processed: ${item}`);
//     }, 1000);
//   });
// }
// tmp();

// [
//   {
//     "index": 1,
//     "spanish": "hola",
//     "english": "hello",
//     "type": "INTERJ"
//   },
//   {
//     "index": 2,
//     "spanish": "adiós",
//     "english": "goodbye",
//     "type": "INTERJ"
//   }
// ]
