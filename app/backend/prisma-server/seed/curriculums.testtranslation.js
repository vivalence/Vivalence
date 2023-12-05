import { PrismaClient } from "@prisma/client";
// so what do i create here? // i create one large curriculum
// of the top nouns. // and some set of verbs.
// nothing fancy. // just for development
// IN ('ADJ', 'ADV', 'ART', 'CONJ', 'INTERJ', 'N', 'NC', 'NF', 'NF_EL', 'NM', 'NM_F', 'NMF', 'NUM', 'PREP', 'PRON')
const prisma = new PrismaClient();

const NounsEnum = ["NC", "NF", "NF_EL", "NM", "NM_F", "NMF"];
const moodTenses = [
    ["NON_FINITE", "INFINITIVO"],
    ["NON_FINITE", "GERUNDIO"],
    ["NON_FINITE", "PARTICIPIO"],
    ["INDICATIVO", "PRESENTE"],
    ["INDICATIVO", "PRETERITO"],
    ["INDICATIVO", "IMPERFECTO"],
    ["INDICATIVO", "FUTURO"],
];

const DRYRUN = false;
const VERB_INDEX = 35;
const TAKE_NOUNS = 200;
const START = 0;

const nouns = await prisma.word.findMany({
    where: { type: { in: NounsEnum } },
    orderBy: { index: "asc" },
    take: TAKE_NOUNS,
});
const nounUnits = await prisma.unit.findMany({
    where: { corpusId: { in: nouns.map((noun) => noun.id) } },
});

let index = 200;
const conjUnits = [];
for (const [mood, tense] of moodTenses) {
    const conjugations = await prisma.conjugation.findMany({
        where: { mood, tense, verb: { index: { lte: VERB_INDEX } } },
        orderBy: { verb: { index: "asc" } },
    });

    const units = await prisma.unit.findMany({
        where: { corpusId: { in: conjugations.map((conj) => conj.id) } },
    });

    units.map((unit) => {
        unit.data.index = index++;
        conjUnits.push(unit);
    });
}

console.log(conjUnits.length, nounUnits.length);

const data = {
    name: "Test for Translations",
    unitRelations: {
        create: [...conjUnits, ...nounUnits].map((unit) => ({
            unit: { connect: { id: unit.id } },
            index: unit.data.index,
        })),
    },
};

const update = await prisma.curriculum.create({ data });
