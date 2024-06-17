import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { ConjugationMap, askYesNoQuestion, getEnding, sleep, PerformerEnum } from "./lib";
import conjugationMap from "./data/conjugationMap.json";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: "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" });

const adminPrompt = `You act as a Spanish Autocomplete Grammar API for verb conjugations.
Don't change structure of JSON, only fill undefined values. 
respond to incomplete JSON with complete JSON. `;

async function getGPTResponse(prompt = []) {
    const stream = await openai.beta.chat.completions.stream({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: "user",
                content: adminPrompt,
            },
            ...prompt.map((p) => ({ role: "user", content: p })),
        ],
        response_format: { type: "json_object" },
        stream: true,
    });

    // let chunkcounter = 0; for await (const chunk of stream) {chunkcounter++; chunkcounter % 10 === 0 && console.log("chunkcounter", chunkcounter, chunk.choices[0]?.delta?.content);}

    const chatCompletion = await stream.finalChatCompletion();
    return JSON.parse(chatCompletion.choices[0].message.content);
}

export async function create_FINITEs(verb, tense, mood, index, performers = PerformerEnum) {
    console.log(index, verb.spanish, "create_FINITEs", tense, mood);
    const data = {
        infinitivo_spanish: verb.spanish,
        infinitive_english: verb.english,
        target_mood: mood,
        target_tense: tense,
        ...PerformerEnum.reduce(
            (acc, performer) => ({
                ...acc,
                [performer]: { spanish: "", english: "" },
            }),
            {},
        ),
    };

    const conjugation = await getGPTResponse([JSON.stringify(data)]);
    // console.log("conjugation", conjugation);

    const ending = getEnding(verb.spanish);

    try {
        const promises = [];
        for (const performer of performers) {
            const spanish = conjugation[performer].spanish;
            const english = conjugation[performer].english;

            const conjugationData = {
                verbId: verb.id,
                spanish: spanish,
                english: english,
                performer,
                tense,
                mood,
                ending,
            };

            const where = {
                verbId_tense_performer_mood: {
                    verbId: verb.id,
                    performer: performer,
                    tense: tense,
                    mood: mood,
                },
            };
            const expect = prisma.conjugation.upsert({
                where: where,
                update: conjugationData,
                create: conjugationData,
            });
            promises.push(expect);
        }
        const result = await Promise.all(promises);
        // console.log("result", result);
        console.log(index, verb.spanish, "created FINITES:", mood, tense);
        return true;
    } catch (e) {
        console.log("e", e, verb, data);
        return false;
    }
}
export async function create_NON_FINITEs(verb, tense, mood, index) {
    console.log(index, verb.spanish, "create_NON_FINITEs", tense, mood);
    const data = {
        infinitivo_spanish: verb.spanish,
        infinitive_english: verb.english,
        target_mood: mood,
        target_tense: tense,
        english: "",
        spanish: "",
    };
    const conjugation = await getGPTResponse([JSON.stringify(data)]);

    const ending = getEnding(verb.spanish);
    const result = await prisma.conjugation.upsert({
        where: {
            verbId_tense_performer_mood: {
                verbId: verb.id,
                tense: tense,
                mood: mood,
                performer: "NON_FINITE",
            },
        },
        update: {
            spanish: conjugation.spanish,
            english: conjugation.english,
            ending,
        },
        create: {
            verbId: verb.id,
            tense,
            spanish: conjugation.spanish,
            english: conjugation.english,
            ending,
        },
    });

    console.log(index, verb.spanish, "created NON FINITES:", mood, tense);
    return true;
}

async function getVerbs(TAKE, START) {
    const verbs = await prisma.word.findMany({
        where: { type: "V" },
        orderBy: { index: "asc" },
        take: TAKE,
        skip: START,
    });
    return verbs;
}

async function main() {
    const finiteMoodTenses = [
        "INDICATIVO:PRESENTE",
        "INDICATIVO:PRETERITO",
        "INDICATIVO:IMPERFECTO",
        "INDICATIVO:FUTURO",
        "INDICATIVO:CONDICIONAL",
        "INDICATIVO:FUTURO_PERFECTO",
        // "IMPERATIVO_AFIRMATIVO:NON_TEMPORAL",
        // "IMPERATIVO_NEGATIVO:NON_TEMPORAL", // these two must be handled because they only have 3 forms
        "SUBJUNTIVO:PRESENTE",
        "SUBJUNTIVO:IMPERFECTO",
    ];
    const infiniteMoodTenses = [
        "NON_FINITE:INFINITIVO",
        "NON_FINITE:GERUNDIO",
        "NON_FINITE:PARTICIPIO",
    ];

    const TAKE = 10;
    const START = 140;
    let index = START;
    const verbs = await getVerbs(TAKE, START);

    const promises = [];
    for (const verb of verbs) {
        for (const moodTense of finiteMoodTenses) {
            const [mood, tense] = moodTense.split(":");
            promises.push(create_FINITEs(verb, tense, mood, index++));
            await sleep(600);
        }
        for (const moodTense of infiniteMoodTenses) {
            const [mood, tense] = moodTense.split(":");
            promises.push(create_NON_FINITEs(verb, tense, mood, index++));
            await sleep(300);
        }
    }
    await Promise.all(promises);
}
// await main()

// const upsertUser = await prisma.user.upsert({
//   where: {
//     email: 'viola@prisma.io',
//   },
//   update: {
//     name: 'Viola the Magnificent',
//   },
//   create: {
//     email: 'viola@prisma.io',
//     name: 'Viola the Magnificent',
//   },
// })

// const sum = {}; for (const key of Object.keys(conjugationMap)) {const counter = {}; for (const verb of conjugationMap[key]) {for (const verbKey of Object.keys(verb)) {counter[verb[verbKey]] = counter[verb[verbKey]] ? [...counter[verb[verbKey]], verbKey] : [verbKey];}} for (const count of Object.keys(counter)) {counter[count] = counter[count].length;} sum[key] = counter;}
// {"NON_FINITE:INFINITIVO": {"0": 1120}, "NON_FINITE:GERUNDIO": {"0": 623, "1": 497}, "NON_FINITE:PARTICIPIO": {"0": 623, "1": 497}, "IMPERATIVO_AFIRMATIVO:NON_TEMPORAL": {"0": 620, "6": 500}, "IMPERATIVO_NEGATIVO:NON_TEMPORAL": {"0": 620, "6": 500}, "INDICATIVO:PRESENTE": {"0": 619, "6": 501}, "INDICATIVO:PRETERITO": {"0": 619, "6": 501}, "INDICATIVO:IMPERFECTO": {"0": 619, "6": 501}, "INDICATIVO:FUTURO": {"0": 619, "6": 501}, "INDICATIVO:CONDICIONAL": {"0": 619, "6": 501}, "INDICATIVO:FUTURO_PERFECTO": {"0": 619, "6": 501}, "INDICATIVO:PLUSCUAMPERFECTO": {"0": 619, "6": 501}, "INDICATIVO:PRESENTE_PERFECTO": {"0": 619, "6": 501}, "INDICATIVO:PRETERITO_ANTERIOR": {"0": 619, "6": 501}, "INDICATIVO:CONDICIONAL_PERFECTO": {"0": 619, "6": 501}, "SUBJUNTIVO:PRESENTE": {"0": 619, "6": 501}, "SUBJUNTIVO:IMPERFECTO": {"0": 619, "6": 501}, "SUBJUNTIVO:FUTURO": {"0": 619, "6": 501}, "SUBJUNTIVO:FUTURO_PERFECTO": {"0": 619, "6": 501}, "SUBJUNTIVO:PLUSCUAMPERFECTO": {"0": 619, "6": 501}, "SUBJUNTIVO:PRESENTE_PERFECTO": {"0": 619, "6": 501}}
// const countConjugations = (verb) => {let cm = {}; while (verb.conjugations.length > 0) {const conjugation = verb.conjugations.pop(); const { tense, mood, performer } = conjugation; cm[`${mood}:${tense}`] = (cm[`${mood}:${tense}`] || 0) + 1;} return cm;};
// for (const verb of verbs) {const cm = countConjugations(verb); for (const moodTense of Object.keys(ConjugationMap)) {if (!cm[moodTense] || ConjugationMap[moodTense] !== cm[moodTense]) {const [mood, tense] = moodTense.split(":"); console.log("missing", verb.spanish, mood, tense);}}}
