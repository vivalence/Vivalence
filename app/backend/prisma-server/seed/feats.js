import { PrismaClient } from "@prisma/client";
import nlp from "../../src/services/nlp/index.js";
import parseFeats from "../../src/services/nlp/feats.js";
import { sleep, mergeDeep, batchArray } from "./lib.js";

const map = {
    Tense: ["Present", "Future", "Imperfect", "Past"],
    Mood: ["Indicative", "Subjunctive", "Conditional", "Imperative"],
    Person: ["Second", "Third", "First"],
    Number: ["Singular", "Plural"],

    VerbForm: ["Infinitive", "Participle", "Finite", "Gerund"],
    Gender: ["Feminine", "Masculine"],

    Polarity: ["Negative"],
    Case: ["Accusative"],
    PronType: ["Personal"],
    Reflex: ["Yes"],

    PrepCase: ["Npr"],
    NumType: ["Ord"],
    AdvType: ["Tim"],
};

const prisma = new PrismaClient();
// itterate through each word
// find its lemma
// update the word with the lemma
const TAKE = 200000;
const START = 0;

const BATCHSIZE = 100;
const BATCHINTERVAL = 3000;

let index = START;

async function getWords(TAKE, START) {
    const words = (
        await prisma.word.findMany({
            take: TAKE,
            skip: START,
        })
    ).map((word) => {
        word.type = "word";
        return word;
    });
    return words;
}
async function getConjugations(TAKE, START) {
    const words = (
        await prisma.conjugation.findMany({
            take: TAKE,
            skip: START,
        })
    ).map((word) => {
        word.type = "conjugation";
        return word;
    });
    return words;
}

async function main() {
    const corpus = [...(await getWords(TAKE, START)), ...(await getConjugations(TAKE, START))];
    const batches = batchArray(corpus, BATCHSIZE);

    const results = [];
    const promises = [];

    for (const batch of batches) {
        console.log(`batch ${index++}/${batches.length}`);
        promises.push(
            (async (index) => {
                for (const currentValue of batch) {
                    try {
                        const doc = (
                            await nlp(currentValue.lemmaSpanish || currentValue.spanish)
                        )[0];
                        const feats = doc.feats ? parseFeats(doc.feats) : {};
                        await prisma[currentValue.type].update({
                            where: { id: currentValue.id },
                            data: {
                                ud: {
                                    text: doc.text,
                                    lemma: doc.lemma,
                                    upos: doc.upos,
                                    xpos: doc.xpos,
                                    udFeats: doc.feats,
                                    feats,
                                },
                            },
                        });
                    } catch (error) {
                        console.log(
                            "error",
                            index,
                            error.message,
                            currentValue.id,
                            currentValue.spanish,
                            currentValue.type,
                        );
                    }
                }

                console.log(`batch finished ${index}/${batches.length}`);
            })(index),
        );
        await sleep(BATCHINTERVAL);
    }

    console.log(`all batches launched`);
    const result = await Promise.all(promises);
    console.log(`batches finished`);
}

await main();
