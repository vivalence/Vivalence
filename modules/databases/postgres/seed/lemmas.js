import { PrismaClient } from "@prisma/client";
import nlp from "../../src/services/nlp/index.js";
import { sleep } from "./lib.js";

const prisma = new PrismaClient();
// itterate through each word
// find its lemma
// update the word with the lemma
const TAKE = 1;
const START = 000;

const BATCHSIZE = 50;
const BATCHINTERVAL = 500;

let index = START;

async function getWords(TAKE, START) {
  const words = await prisma.word.findMany({
    where: { lemmaSpanish: null },
    take: TAKE,
    skip: START,
  });
  return words;
}
async function getConjugations(TAKE, START) {
  const words = await prisma.conjugation.findMany({
    where: { lemmaSpanish: null },
    take: TAKE,
    skip: START,
  });
  return words;
}

let mismatch = 0;
let noLemma = 0;

async function main() {
  // const words = await getWords(TAKE, START);
  const conjugations = await getConjugations(TAKE, START);
  console.log("conjugations", conjugation.length);

  const promises = [];
  for (let conjugation of conjugations) {
    index++;

    // if word.spanish contains a semicolon, split it and continue with the first part
    // if (word.spanish.includes(";")) {const parts = word.spanish.split(";"); word.spanish = parts[0];}

    if (index % BATCHSIZE === 0) await sleep(BATCHINTERVAL);

    promises.push(
      (async (conjugation, index) => {
        const doc = await nlp(conjugation.spanish);

        // plural: if word.spanish minus the last character matches a lemma, update the word with the lemma
        // if (doc.length === 1 && doc[0].lemma === word.spanish.slice(0, -1)) {console.log(word.spanish, doc[0].lemma); const update = await prisma.word.update({where: { id: word.id }, data: { lemmaSpanish: doc[0].lemma, ud: doc[0] },});}

        // gender: if word.spanish minus the last character matches a lemma minus the last character, update the word with the lemma and last lemma character is o and last word character is a, update the word with the lemma
        // if (doc.length === 1 && doc[0].lemma.slice(0, -1) === word.spanish.slice(0, -1) && doc[0].lemma.slice(-1) === "o" && word.spanish.slice(-1) === "a") {console.log(word.spanish, doc[0].lemma); const update = await prisma.word.update({where: { id: word.id }, data: { lemmaSpanish: doc[0].lemma, ud: doc[0] },});}

        if (doc.length !== 1) {
          noLemma++;
          console.log(
            `${index}/${words.length} ${word.spanish} / ${word.english} has ${doc.length} lemmas`,
          );
          return;
        }
        if (doc[0].lemma !== word.spanish) {
          mismatch++;
          console.log(
            `${index}/${words.length} ${word.spanish} / ${word.english} does not match ${doc[0].lemma}`,
          );
          return;
        }
      })(word, index),
    );
  }
  await Promise.all(promises);
}

await main();

console.log("mismatch", mismatch);
console.log("noLemma", noLemma);
console.log("orphans", noLemma + mismatch);
