import { PrismaClient } from "@prisma/client";
import verbEndings from "./data/verbEndings.json";

const prisma = new PrismaClient();

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://valence:DUMMY@localhost:5432/valence-spanish-vII",
    },
  },
});

async function main() {
  for (const verb of verbEndings) {
    console.log(verb);
    throw Error("stop");

    try {
      const data = {
        ...verb,
      };

      // const update = await prisma.verbEnding.create({ data });
      // const update = await prisma..updateMany({where: { index: data.index }, data});
      console.log("update", update.index);
    } catch (e) {
      console.error("[error]", e);
    }
  }
}

// await prisma.word.deleteMany();
await main();

// # top 100 verbs
const data = await targetPrisma.verbEnding.findMany({});
console.log("verbEndings", data.length);

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
