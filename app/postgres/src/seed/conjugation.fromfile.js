import { performerEnum, removeDiacritics } from "./lib.js";
import { PrismaClient } from "@prisma/client";
import grammarData from "./conjugation.json";
// import wordsData from "./words.json";

const prisma = new PrismaClient();
const notFound = [];
const START = 0;
let index = START;

async function main() {
    const set = grammarData.slice(START);
    for (const grammar of set) {
        index++;

        try {
            return;
            const word = await prisma.word.findMany({
                where: { spanish: grammar.infinitive, type: "V" },
            });

            if (!word.length > 0) {
                // if (!notFound.includes(grammar.infinitive)) {
                // console.log("word", grammar.infinitive, index);
                notFound.push(grammar.infinitive);
                // }
                continue;
            }

            const tense = grammar.tense;
            const mood = grammar.mood;
            const ending = removeDiacritics(grammar.infinitive.slice(-2).toUpperCase());

            const data = { tense, ending, mood, verbId: word[0].id };

            for (const performer of performerEnum) {
                data["value"] = grammar[performer];
                data["performer"] = performer;
                // test value for empty string
                if (data["value"].length !== 0) await prisma.conjugation.create({ data });
            }

            // on this unique case, we need to create two more conjugations
            if (tense === "PRESENTE" && mood === "INDICATIVO") {
                data["mood"] = "NON_FINITE";
                data["performer"] = "NON_FINITE";

                data["value"] = grammar.gerund;
                data["tense"] = "GERUNDIO";
                if (data["value"].length !== 0) await prisma.conjugation.create({ data });

                data["value"] = grammar.pastparticiple;
                data["tense"] = "PARTICIPIO";

                if (data["value"].length !== 0) await prisma.conjugation.create({ data });
            }
        } catch (e) {
            // console.error("[error]", index, JSON.stringify(e, null, 2));
            if (e.code === "P2002") continue;
            console.error("[error]", index, e);
            break;
        }
    }
    console.log("notFound", notFound.length);
}

await main();

// // # top 100 verbs
const conjugation = await prisma.conjugation.findMany({
    //   // orderBy: { index: "asc" },
    //   // where: { type: "V" },
    //   // take: 25,
});

console.log("conjugation", conjugation.length);

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
