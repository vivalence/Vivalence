import { PrismaClient } from "@prisma/client";

// function that sends a json {sentence} to :5000/pipeline and returns the response
const pipeline = async (sentence) => {
    const response = await fetch("http://127.0.0.1:5000/pipeline", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ sentence }),
    });
    const json = await response.json();
    return json;
};

const spanishWords = {
    nouns: [
        "casa",
        "perro",
        "gato",
        "libro",
        "ciudad",
        "coche",
        "árbol",
        "flor",
        "mesa",
        "silla",
        "ventana",
        "puerta",
        "reloj",
        "teléfono",
        "sol",
        "luna",
        "estrella",
        "cielo",
        "mar",
        "río",
        "montaña",
        "bosque",
        "playa",
        "niño",
        "niña",
        "amigo",
        "amiga",
        "madre",
        "padre",
        "hermano",
        "hermana",
        "maestro",
        // "maestra",
        "papel",
        "lápiz",
        "computadora",
        "jardín",
        "calle",
        "restaurante",
        "escuela",
        "universidad",
        "librería",
        "mercado",
        "hotel",
        "hospital",
        "iglesia",
        "parque",
        "museo",
        "teatro",
        "cine",
    ],
    adjectives: [
        "grande",
        "pequeño",
        "alto",
        "bajo",
        "largo",
        "corto",
        "ancho",
        "estrecho",
        "rápido",
        "lento",
        "caliente",
        "frío",
        "duro",
        "blando",
        "pesado",
        "ligero",
        "suave",
        "áspero",
        "limpio",
        "sucio",
        "nuevo",
        "viejo",
        "bonito",
        "feo",
        "bueno",
        "malo",
        "rico",
        "pobre",
        "fuerte",
        "débil",
        "joven",
        "viejo",
        "alegre",
        "triste",
        // "ocupado",
        "libre",
        "sano",
        "enfermo",
        "lleno",
        "vacío",
        "abierto",
        "cerrado",
        "claro",
        "oscuro",
        "seco",
        "húmedo",
        "duro",
        "blando",
        "amargo",
        "dulce",
    ],
    verbs: [
        "ser",
        "tener",
        "hacer",
        "ir",
        "poder",
        "decir",
        "ver",
        "dar",
        "saber",
        "querer",
        "llegar",
        "pasar",
        "deber",
        "poner",
        "parecer",
        "quedar",
        "creer",
        "hablar",
        "llevar",
        "dejar",
    ],
};

// const PullMap = [["ADJECTIVE", 1000], ["ADPOSITION", 5000], ["ADVERB", 1050], ["NUMERAL", 5000], ["PRONOUN", 5000], ["VERB", 300],];

const prisma = new PrismaClient();

const DRYRUN = true;
const VERB_INDEX = 35;
const TAKE_NOUNS = 500;
const START = 0;

async function curriculum() {
    //try to find each word in spanishWords in the database under word.spanish
    for (const [pos, words] of Object.entries(spanishWords)) {
        for (const word of words) {
            const dbWord = await prisma.word.findFirst({
                where: { spanish: word },
            });

            if (!dbWord) console.log("[NOT FOUND]", word);
            else if (dbWord.spanish != word) console.log("[MISMATCH]", word, dbWord.spanish);
            else {
                console.log(word, dbWord.spanish);

                const unit = await prisma.unit.findFirst({
                    where: { corpusId: dbWord.id },
                });

                const data = {
                    unitRelations: {
                        create: {
                            unit: { connect: { id: unit.id } },
                            index: unit.data.index,
                        },
                    },
                };

                const curriculum = await prisma.curriculum.update({
                    where: {
                        id: "clqcnpxn40000g04jxtgskgrx",
                    },
                    data,
                });
            }
        }
    }

    // const nouns = await prisma.word.findMany({
    //     where: { pos: { hasSome: ["NOUN"] } },
    //     orderBy: { index: "asc" },
    //     take: TAKE_NOUNS,
    // });
    // for (const noun of nouns) {
    //     const pipelineResponse = await pipeline(noun.spanish);
    //     if (noun.spanish != pipelineResponse[0][0].lemma)
    //         console.log(noun.spanish, pipelineResponse[0][0]);
    //     // const { tags } = pipelineResponse[0];
    //     // const { lemma } = pipelineResponse[0];
    //     // console.log("noun", noun.spanish, lemma, tags);
    // }
}
// await curriculum();

async function games() {
    const translations = await prisma.game.create({
        data: {
            type: "TRANSLATIONS",
            curriculumRelation: {
                create: {
                    curriculum: { connect: { id: "clqcnpxn40000g04jxtgskgrx" } },
                    mask: { connect: { id: "clpr5668n0002g01pnxhkh8nf" } },
                },
            },
        },
    });
    const flashcards = await prisma.game.create({
        data: {
            type: "FLASHCARDS",
            curriculumRelation: {
                create: {
                    curriculum: { connect: { id: "clqcnpxn40000g04jxtgskgrx" } },
                    mask: { connect: { id: "clq0z4qxv0002g0f8f93uwkc4" } },
                },
            },
        },
    });
}
await games();

let index = 0;
const updateList = [];

// console.log("curriculum", curriculum);
