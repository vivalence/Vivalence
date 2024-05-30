import { PerformerEnum, removeDiacritics } from "./lib.js";
import { PrismaClient } from "@prisma/client";
import grammarData from "./data/conjugation.json";
// import wordsData from "./words.json";

const prisma = new PrismaClient();
const createGrammar = async (verb, grammar) => {
    const createManyData = [];

    const tense = grammar.tense;
    const mood = grammar.mood;
    const ending = removeDiacritics(grammar.infinitive.slice(-2).toUpperCase());

    const data = { tense, ending, mood, verbId: verb.id };

    for (const performer of PerformerEnum) {
        data["spanish"] = grammar[performer];
        data["performer"] = performer;
        if (data.spanish) createManyData.push({ ...data });
    }

    // on this unique case, we need to create two more conjugations
    if (tense === "PRESENTE" && mood === "INDICATIVO") {
        data["mood"] = "NON_FINITE";
        data["performer"] = "NON_FINITE";

        // data["tense"] = "INFINITIVO";
        // data["spanish"] = grammar.infinitive;
        // data["english"] = grammar.infinitive_english;
        // await prisma.conjugation.upsert({where: {verbId_tense_performer_mood: {tense: data.tense, mood: data.mood, verbId: verb.id, performer: "NON_FINITE",},}, create: data, update: data,});

        data["tense"] = "GERUNDIO";
        data["spanish"] = grammar.gerund;
        data["english"] = grammar.gerund_english;
        if (data.spanish) createManyData.push({ ...data });

        data["tense"] = "PARTICIPIO";
        data["spanish"] = grammar.pastparticiple;
        data["english"] = grammar.pastparticiple_english;
        if (data.spanish) createManyData.push({ ...data });
    }

    return prisma.conjugation.createMany({ data: createManyData });
};

const notFound = [];
const TAKE = 10000;
const START = 0;
let index = START;

async function main() {
    const verbs = await prisma.word.findMany({
        where: { type: "V" },
        orderBy: { index: "asc" },
        take: TAKE,
        skip: START,
    });

    for (const verb of verbs) {
        try {
            const promises = [];
            index++;
            console.log(`${index}: `, verb.spanish, verb.index, verb.english);

            let grammars = grammarData.filter((g) => g.infinitive === verb.spanish);

            if (!grammars.length > 0) {
                notFound.push(verb.spanish);
            }

            for (const grammar of grammars) {
                promises.push(createGrammar(verb, grammar));
            }
            const counts = await Promise.all(promises);
            console.log("counts", counts);
        } catch (e) {
            // console.error("[error]", index, JSON.stringify(e, null, 2));
            if (e.code !== "P2002") console.error("[error]", index, e);
            // else console.error(e);
        }
    }
    // console.log("notFound", notFound);
    console.log("notFound", notFound.length);
}

await main();

// // # top 100 verbs

// let exampleGrammar = {
//   _id: "5f25d1488a24ce3410da9e59",
//   infinitive: "abandonar",
//   infinitive_english: "to abandon, leave behind, desert; to quit, give up",
//   mood: "INDICATIVO",
//   mood_english: "Indicative",
//   tense: "PRESENTE",
//   tense_english: "Present",
//   verb_english: "I abandon, am abandoning",
//   gerund: "abandonando",
//   gerund_english: "abandoning",
//   pastparticiple: "abandonado",
//   pastparticiple_english: "abandoned",
//   YO: "abandono",
//   TU: "abandonas",
//   EL_ELLA_USTED: "abandona",
//   NOSOTROS_NOSOTRAS: "abandonamos",
//   VOSOTROS_VOSOTRAS: "abandonáis",
//   ELLOS_ELLAS_USTEDES: "abandonan",
// };

// model Conjugation {
//   // Meta
//   id String @id @default(cuid())

//   // It
//   value     String
//   tense     TenseEnum
//   performer PerformerEnum
//   ending    EndingEnum
//   mood      MoodEnum
//   // Up
//   verb   Word   @relation(fields: [verbId], references: [id])
//   verbId String
//   // Down
//   verbStem   VerbStem?
//   verbEnding VerbEnding?
// }
