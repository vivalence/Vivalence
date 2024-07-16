import { PrismaClient } from "@prisma/client";
const PullMap = [
  ["ADJECTIVE", 1000],
  ["ADPOSITION", 5000],
  ["ADVERB", 1050],
  ["NUMERAL", 5000],
  ["PRONOUN", 5000],
  ["VERB", 300],
];

const prisma = new PrismaClient();

const DRYRUN = false;
const VERB_INDEX = 35;
const TAKE_NOUNS = 200;
const START = 0;

// const nouns = await prisma.word.findMany({
//     where: { type: { in: NounsEnum } },
//     orderBy: { index: "asc" },
//     take: TAKE_NOUNS,
// });
// const nounUnits = await prisma.unit.findMany({
//     where: { corpusId: { in: nouns.map((noun) => noun.id) } },
// });

let index = 200;
const updateList = [];

const curriculum = await prisma.curriculum.findUnique({
  where: {
    id: "clpl75uu00000g0mwkivlcucv",
    unitRelations: { some: { unit: { tags: { some: { name: "VERB_CONJUGATION" } } } } },
  },
  include: {
    unitRelations: {
      include: { unit: { include: { tags: { select: { name: true } } } } },
      where: { unit: { tags: { some: { name: "VERB_CONJUGATION" } } } },
      orderBy: { index: "asc" },
    },
  },
});
console.log("curriculum", curriculum.unitRelations.length, curriculum.unitRelations[0]);

// for (const [tagName, indexLimit] of PullMap) {
//     const words = await prisma.word.findMany({
//         where: { index: { lte: indexLimit }, pos: { has: tagName } },
//         orderBy: { index: "asc" },
//     });

//     const units = await prisma.unit.findMany({
//         where: { corpusId: { in: words.map((word) => word.id) } },
//         include: { tags: { select: { name: true } } },
//     });

//     console.log("words", units.length, words.length, tagName, indexLimit);

//     units.map((unit) => {
//         unit.data.index = index++;
//         updateList.push(unit);
//     });
// }

// console.log(updateList.length);

// const data = {
//     unitRelations: {
//         create: updateList.map((unit) => ({
//             unit: { connect: { id: unit.id } },
//             index: unit.data.index,
//         })),
//     },
// };

// const update = await prisma.curriculum.update({
//     where: { id: "clpl75uu00000g0mwkivlcucv" },
//     data,
// });

// console.log("update", update);
