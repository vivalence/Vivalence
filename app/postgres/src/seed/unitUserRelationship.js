// // fetch unit
// // for each unit
// // create unituserrelation
// import { sleep, writeToFile } from "./lib.js";
// import verbs from "./data/top150verbIds.json";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({});

// const TAKE = 1;
// const START = 00;
// let index = 0;

// const units = await prisma.unit.findMany({
//     where: { type: "V" },
//     take: TAKE,
//     skip: START,
// });

// async function main() {
//     const promises = [];
//     for (const verbId of verbs.slice(START, TAKE + START)) {
//         // try {
//         for (const [mood, tense] of moodTenses) {
//             const createMany = [];

//             prisma.conjugation
//                 .findMany({
//                     where: { tense, mood, verbId },
//                 })
//                 .then((conjugations) => {
//                     for (const conjugation of conjugations) {
//                         index++;
//                         createMany.push({
//                             data: {
//                                 spanish: conjugation.spanish,
//                                 english: conjugation.english,
//                                 tense: conjugation.tense,
//                                 performer: conjugation.performer,
//                                 mood: conjugation.mood,
//                                 ending: conjugation.ending,
//                                 corpusVerbId: conjugation.verbId,
//                             },
//                             corpusId: conjugation.id,
//                             unitType: "CONJUGATION",
//                             status: "UNKNOWN",
//                         });
//                     }

//                     promises.push(
//                         prisma.unit.createMany({ data: createMany, skipDuplicates: true }),
//                     );
//                 });
//         }
//         await sleep(1000);
//         console.log("Index", index, verbId);
//         // } catch (e) {
//         //     if (e.code !== "P2002") console.error("[error]", index, e);
//         //     // console.error(e);
//         // }
//     }
//     await Promise.all(promises);
// }
// await main();
// console.log("final count", index);
