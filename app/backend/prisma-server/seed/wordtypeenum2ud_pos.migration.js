const lookup = {
    ART: ["DETERMINER"],
    ADJ: ["ADJECTIVE"],
    ADV: ["ADVERB"],
    CONJ: ["CONJUNCTION_COORDINATING", "CONJUNCTION_SUBORDINATING"],
    F: ["GENDER_FEMININE"],
    MINUS_FAM: ["POLITE_FORMAL"],
    PLUS_FAM: ["POLITE_INFORMAL"],
    INTERJ: ["INTERJECTION"],
    M: ["GENDER_MASCULINE"],
    N: ["GENDER_NEUTER"],
    NC: ["NOUN"],
    NF: ["NOUN", "GENDER_FEMININE"],
    NF_EL: ["NOUN", "GENDER_FEMININE"],
    NM: ["NOUN", "GENDER_MASCULINE"],
    NMF: ["NOUN"],
    NM_F: ["NOUN"],
    NUM: ["NUMERAL"],
    // OBJ: ["PRONTYPE_PERSONAL"],
    // DIR_OBJ: ["PRONTYPE_PERSONAL"],
    // INDIR_OBJ: ["PRONTYPE_PERSONAL"],
    // PL: ["NUMBER_PLURAL"],
    PREP: ["ADPOSITION"],
    PRON: ["PRONOUN"],
    // SG: ["NUMBER_SINGULAR"],
    // SUBI: ["PRONTYPE_PERSONAL"],
    V: ["VERB"],
    SPEAKERS: [],
};

import { sleep } from "./lib.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAKE = 10000;
const START = 0;
const BATCHSIZE = 100;
let index = START;

async function main() {
    for (const type in lookup) {
        console.log(type);
        await prisma.word.updateMany({
            where: {
                type,
            },
            data: {
                pos: lookup[type],
            },
        });
    }
    return;

    try {
        const promises = [];

        while (words.length > 0) {
            const batch = words.splice(0, BATCHSIZE);

            for (const word of batch) {
                index++;
                const { id, type } = word;
                const update = prisma.word.update({ where: { id }, data: { pos: lookup[type] } });
                promises.push(update);
            }

            console.log(`${index}:${words.length}`);

            await sleep(1000);
        }

        const counts = await Promise.all(promises);
        console.log("counts", counts.length);
    } catch (e) {
        if (e.code !== "P2002") console.error("[error]", index, e);
    }
    // console.log("notFound", notFound.length);
}

await main();
