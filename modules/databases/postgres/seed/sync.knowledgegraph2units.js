// itterate through the corpus and push each to its unit.
import { sleep } from "./lib.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dry = false;

const TAKE = 100000;
const START = 0;

const BATCHSIZE = 100;
const BATCHINTERVAL = 1000;

let index = START;

async function findConjugation(id) {
  const corpus = await prisma.conjugation.findUnique({ where: { id } });
  corpus.source = "conjugation";
  return corpus;
}
async function findWord(id) {
  const corpus = await prisma.word.findUnique({ where: { id } });
  corpus.source = "word";
  return corpus;
}
const finders = { conjugation: findConjugation, word: findWord };

function buildConjugation(unitKG, unitApp) {
  const data = {
    ...unitApp.data,
    ud: unitKG.ud,
  };
  return data;
}
function buildWord(unitKG, unitApp) {
  const data = {
    ...unitApp.data,
    ud: unitKG.ud,
    lemmaSpanish: unitKG.ud.lemma,
  };
  return data;
}
const builders = { conjugation: buildConjugation, word: buildWord };

async function updateUnit(unit, data) {
  if (dry) {
    console.log("dry", unit, data);
    return;
  }
  const update = await prisma.unit.update({
    where: {
      id: unit.id,
    },
    data,
  });
  return update;
}

async function pull() {
  const unitsApp = await prisma.unit.findMany({
    where: { unitType: "WORD" },
    take: TAKE,
    skip: START,
  });

  // console.log("units", unitsApp.length);

  const promises = [];
  for (const unitApp of unitsApp) {
    index++;

    promises.push(
      (async (index) => {
        const unitKG = await finders[unitApp.unitType.toLowerCase()](unitApp.corpusId);
        const data = builders[unitApp.unitType.toLowerCase()](unitKG, unitApp);
        await updateUnit(unitApp, { data });
      })(index),
    );

    if (index % BATCHSIZE === 0) {
      console.log(`batch launched ${index / BATCHSIZE} / ${unitsApp.length / BATCHSIZE}`);
      await sleep(BATCHINTERVAL);
    }
  }

  const result = await Promise.all(promises);
  console.log("result", result.length);
}

async function push() {
  const words = await prisma.word.findMany({
    take: TAKE,
    skip: START,
  });

  console.log("words", words.length);

  const promises = [];
  for (const word of words) {
    index++;
    promises.push(
      (async (index) => {
        const hasUnit = await prisma.unit.findFirst({
          where: { corpusId: word.id },
        });
        if (!hasUnit) {
          const unit = await prisma.unit.create({
            data: {
              corpusId: word.id,
              unitType: "WORD",
              data: {
                ud: word.ud,
                pos: word.pos,
                type: word.type,
                index: word.index,
                english: word.english,
                spanish: word.spanish,
                lemmaEnglish: null,
                lemmaSpanish: word.lemmaSpanish,
                usageInEnglish: word.usageInEnglish,
                usageInSpanish: word.usageInSpanish,
              },
            },
          });
          console.log(index, "created", word.spanish);
        }
      })(index),
    );

    if (index % BATCHSIZE === 0) {
      console.log(`batch launched ${index / BATCHSIZE} / ${words.length / BATCHSIZE}`);
      await sleep(BATCHINTERVAL);
    }
  }

  const result = await Promise.all(promises);
  console.log("result", result.length);
}

// await push();
