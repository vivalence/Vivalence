import axios from "axios";
import prisma from "../../prisma-client.js";
import parseFeats from "./feats.js";

export default async function (sentence, options = {}) {
    try {
        // const PORT = Math.floor(Math.random() * 10) + 5050;
        // http://service-nlp:5000
        const path = process.env.SERVICE_NLP_URL;
        const response = await axios.post(path, { sentence });
        const analysis = response.data;
        analysis.map((pos) => (pos.feats = parseFeats(pos.feats)));
        if (options.findUnits) await findUnits(analysis);
        return analysis;
    } catch (error) {
        console.error("Error:", Object.keys(error), error.message);
        throw error;
    }
}

export async function findUnits(analysis) {
    const promises = [];
    for (const [i, partOfSpeech] of analysis.entries()) {
        promises.push((async (i) => (analysis[i].unit = await findUnit(partOfSpeech)))(i));
    }
    return await Promise.all(promises);
}
export async function findUnit(partOfSpeech) {
    let unit = null;
    if (["PUNCT", "SPACE"].includes(partOfSpeech.upos)) return unit;
    if (["VERB"].includes(partOfSpeech.upos)) {
        if (!!partOfSpeech.feats.Tense) {
            const mood = partOfSpeech.feats.ENUM.mood;
            unit = await unitFindFirst({
                unitType: "CONJUGATION",
                AND: [
                    {
                        data: {
                            path: ["ud", "lemma"],
                            equals: partOfSpeech.lemma,
                        },
                    },
                    { data: { path: ["mood"], equals: mood } },
                    {
                        data: {
                            path: ["ud", "feats", "Tense"],
                            equals: partOfSpeech.feats.Tense,
                        },
                    },
                ],
            });
        }
        if (!unit) {
            unit = await unitFindFirst({
                unitType: "WORD",
                AND: [
                    {
                        data: {
                            path: ["ud", "lemma"],
                            equals: partOfSpeech.lemma,
                        },
                    },
                    {
                        data: {
                            path: ["ud", "feats", "VerbForm"],
                            equals: partOfSpeech.feats.VerbForm,
                        },
                    },
                ],
            });
        }
    }

    if (
        !unit &&
        // very explicit lol
        [
            "NOUN",
            "PROPN",
            "ADJ",
            "ADV",
            "ADP",
            "AUX",
            "CCONJ",
            "DET",
            "INTJ",
            "NUM",
            "PART",
            "PRON",
            "SCONJ",
            "SYM",
            "X",
        ].includes(partOfSpeech.upos)
    ) {
        unit = await unitFindFirst({
            unitType: "WORD",
            data: {
                path: ["lemmaSpanish"],
                equals: partOfSpeech.lemma,
            },
        });
    }

    return unit;
}
const unitSelect = { id: true, data: true, unitType: true, status: true };
async function unitFindFirst(where, select = unitSelect) {
    return await prisma.unit.findFirst({ where, select });
}

// ADJ: adjective
// ADP: adposition
// ADV: adverb
// AUX: auxiliary
// CCONJ: coordinating conjunction
// DET: determiner
// INTJ: interjection
// NOUN: noun
// NUM: numeral
// PART: particle
// PRON: pronoun
// PROPN: proper noun
// PUNCT: punctuation
// SCONJ: subordinating conjunction
// SYM: symbol
// VERB: verb
// X: other
