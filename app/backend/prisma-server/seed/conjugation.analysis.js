import { ConjugationMap, ImperativeConjugationMap, PerformerEnum, writeToFile } from "./lib.js";
import { create_FINITEs, create_NON_FINITEs } from "./conjugation.fromanalysis.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DRYRUN = false;
const TAKE = 50;
const START = 100;
let index = START;

const verbs = await prisma.word.findMany({
    where: { type: "V" },
    orderBy: { index: "asc" },
    take: TAKE,
    skip: START,
    include: { conjugations: true },
});

// console.log("verbs", verbs.length);

for (const verb of verbs) {
    let cm = Object.keys(ConjugationMap).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

    while (verb.conjugations.length > 0) {
        const { tense, mood, performer, english, spanish } = verb.conjugations.pop();
        const key = `${mood}:${tense}`;
        if (!spanish || !english || !ConjugationMap[key]) continue;
        else cm[key] = cm[key] + 1;
    }

    const missing = Object.keys(ConjugationMap).reduce((acc, key) => {
        if (cm[key] !== ConjugationMap[key])
            return { ...acc, [key]: ConjugationMap[key] - cm[key] };
        return acc;
    }, {});

    console.log("missing", verb.id, verb.spanish, missing);
    if (DRYRUN) continue;

    for (const key of Object.keys(missing)) {
        if (missing[key] === 0) continue;
        const [mood, tense] = key.split(":");

        if (Object.keys(ImperativeConjugationMap).includes(key)) {
            const performers = Object.keys(ImperativeConjugationMap[key]).reduce(
                (acc, performer) => {
                    if (ImperativeConjugationMap[key][performer]) return [...acc, performer];
                    return acc;
                },
                [],
            );

            await create_FINITEs(verb, tense, mood, index, performers);
            // } else if (ConjugationMap[key] < 0) await remove_FINITEs(verb, tense, mood, index);
        } else if (ConjugationMap[key] === 1) await create_NON_FINITEs(verb, tense, mood, index);
        else await create_FINITEs(verb, tense, mood, index);
    }
    // console.log("\n\n\n");
    index++;
}
function removeNaN(obj) {
    return Object.keys(obj).reduce((acc, key) => {
        if (obj[key] > 0) return { ...acc, [key]: obj[key] };
        return acc;
    }, {});
}

// console.log("cm", ConjugationMap);
// await writeToFile(ConjugationMap, "seed/data/conjugationMap.json", true);
