import prisma from "../../prisma-client.js";
import nlp from "../../services/nlp/index.js";
import parseFeats from "../../services/nlp/feats.js";

async function test() {
    const sentence = "Me gusta comer pizza las sábados";
    const doc = await nlp(sentence);

    for (const partOfSentence of doc) {
        let unit;
        if (["PUNCT", "SPACE"].includes(partOfSentence.upos)) continue;
        else if (["VERB"].includes(partOfSentence.upos)) {
            const mood = partOfSentence.feats.ENUM.mood;
            if (!!partOfSentence.feats.Tense) {
                unit = await prisma.unit.findFirst({
                    where: {
                        unitType: "CONJUGATION",
                        AND: [
                            { data: { path: ["ud", "lemma"], equals: partOfSentence.lemma } },
                            { data: { path: ["mood"], equals: mood } },
                            {
                                data: {
                                    path: ["ud", "feats", "Tense"],
                                    equals: partOfSentence.feats.Tense,
                                },
                            },
                        ],
                    },
                });
            }

            if (!unit) {
                unit = await prisma.unit.findFirst({
                    where: {
                        unitType: "WORD",
                        AND: [
                            { data: { path: ["ud", "lemma"], equals: partOfSentence.lemma } },
                            {
                                data: {
                                    path: ["ud", "feats", "VerbForm"],
                                    equals: partOfSentence.feats.VerbForm,
                                },
                            },
                        ],
                    },
                });
            }
        } else {
            unit = await prisma.unit.findFirst({
                where: {
                    unitType: "WORD",
                    AND: [
                        {
                            data: {
                                path: ["lemmaSpanish"],
                                equals: partOfSentence.lemma,
                            },
                        },
                    ],
                },
            });
        }

        // i got the unit.
        // console.log("\n\n\n");

        if (unit) {
            // console.log("unit", unit);
        }
    }
}

// await test();
