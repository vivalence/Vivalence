import { PrismaClient } from "@prisma/client";
import nlp from "../../../../src/services/nlp/index.js";

const prisma = new PrismaClient();
// console.log(await nlp(""));

const curriculumName = "Subject Pronouns and Present Tense Verbs (Top 20)";

const curriculumId = "clr84f70k0000g05rh75z0mv1";
const maskId = "clr84f74f0001g05rl2gh6550";
const spanishWords = {
  nouns: [
    "libro",
    "casa",
    "coche",
    "perro",
    "gato",
    "ciudad",
    "amigo",
    "comida",
    "agua",
    "café",
    "té",
    "zapato",
    "camisa",
    "pantalón",
    "dinero",
    "flor",
    "árbol",
    "parque",
    "película",
    "música",
    "juego",
    "escuela",
    "trabajo",
    "teléfono",
    "computadora",
    "reloj",
    "bolsa",
    "regalo",
    "tarjeta",
    "carta",
    // "supermercado",
    "hospital",
    "restaurante",
    "hotel",
    "playa",
    "montaña",
    "río",
    "sol",
    "luna",
    "estrella",
    "cielo",
    "nube",
    "lluvia",
    "nieve",
    "silla",
    "mesa",
    "ventana",
    "puerta",
    "pared",
    "piso",
    "techo",
    "jardín",
    "piscina",
    "mar",
    "lago",
    "isla",
    "bosque",
    "desierto",
    "pueblo",
    "país",
    "continente",
    "planeta",
    "universo",
    "espacio",
    "arte",
    "cultura",
    "historia",
    "deporte",
    "fútbol",
    // "baloncesto",
    "tenis",
    "natación",
    // "ciclismo",
    "llave",
    "cama",
    // "cuchara",
    // "tenedor",
    "cuchillo",
    "plato",
    "vaso",
    "botella",
    "espejo",
    "toalla",
    "almohada",
    // "cepillo",
    "televisor",
    "radio",
    "lámpara",
    "cuaderno",
    "papel",
    // "tijeras",
    "foto",
    // "florero",
    "alfombra",
    "cortina",
    // "mochila",
    "sombrero",
    // "paraguas",
    "maleta",
    "pan",
    "arroz",
    "pollo",
    "carne",
    "pescado",
    "huevo",
    "leche",
    "queso",
    "manzana",
    // "banana",
    "naranja",
    // "uva",
    "tomate",
    // "zanahoria",
    // "lechuga",
    "papa",
    // "cebolla",
    // "ajo",
    // "frijol",
    "maíz",
    "mercado",
    "tienda",
    // "cafetería",
    "bar",
    "universidad",
    // "zoológico",
    // "acuario",
    "galería",
    "banco",
    "farmacia",
    // "panadería",
    // "peluquería",
    "taller",
    "gasolinera",
    "plaza",
    "tribunal",
    "estadio",
    "puerto",
  ],
  adjectives: [
    "grande",
    "pequeño",
    "largo",
    "corto",
    "alto",
    "bajo",
    "gordo",
    "delgado",
    "joven",
    "viejo",
    "bueno",
    "malo",
    "caliente",
    "frío",
    "rápido",
    "lento",
    "duro",
    "blando",
    "pesado",
    "ligero",
    "suave",
    "áspero",
    "limpio",
    "sucio",
    "fuerte",
    "débil",
    "sano",
    "enfermo",
    "rico",
    "pobre",
    "mucho",
    "poco",
    "todo",
    "algún",
    "ningún",
    "varios",
    "cada",
    "bastante",
    "demasiado",
    "tanto",
    "otro",
    "alguno",
    "ninguno",
    "cualquier",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "feliz",
    "triste",
    "amable",
    "rudo",
    "cálido",
    "inteligente",
    "tonto",
    "listo",
    "preparado",
    "abierto",
    "cerrado",
    "presente",
    "ausente",
    "contento",
    "seguro",
    "inseguro",
    "rojo",
    "azul",
    "verde",
    "amarillo",
    "negro",
    "blanco",
    "naranja",
    "rosa",
    "morado",
    "gris",
    "español",
    "mexicano",
    "argentino",
    "americano",
    "canadiense",
    "francés",
    "alemán",
    "italiano",
    "japonés",
    "chino",
    "bonito",
    "feo",
    "fácil",
    "difícil",
    "lleno",
    "vacío",
    "dulce",
    "amargo",
    "salado",
    "picante",
    "sabroso",
    "insípido",
    "interesante",
    "aburrido",
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
  missing: [
    "joven",
    "algún",
    "ningún",
    "demasiado",
    "cualquier",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "rudo",
    "presente",
    "ausente",
    "inseguro",
    "naranja",
    "rosa",
    "morado",
    "salado",
    "picante",
    "sabroso",
    "insípido",
  ],
  pronouns: ["yo", "tú", "él", "ella", "usted", "nosotros", "vosotros", "ellos", "ellas"],
};
const tenses = [];

const DRYRUN = true;
const VERB_INDEX = 0;
// const TAKE_NOUNS = 500;
const START = 0;

let index = 0;
const misseds = [];
async function curriculum(curriculumId) {
  console.log(spanishWords["nouns"].length);
  console.log(spanishWords["adjectives"].length);

  for (const wordRaw of spanishWords["verbs"]) {
    break;
    const verb = await prisma.word.findFirst({
      where: { spanish: wordRaw, type: "V" },
    });
    const conjugations = await prisma.conjugation.findMany({
      where: {
        verbId: verb.id,
        tense: "PRESENTE",
        mood: "INDICATIVO",
      },
    });
    for (const [i, conjugation] of conjugations.entries()) {
      if (!conjugations === 6) console.log("[NOT FOUND]", word, conjugations.length);
      else {
        const unit = await prisma.unit.findFirst({
          where: { corpusId: conjugation.id, unitType: "CONJUGATION" },
        });
        if (!unit) throw new Error("Unit not found");

        const curriculum = await prisma.curriculum.update({
          where: {
            id: curriculumId,
          },
          data: {
            unitRelations: {
              create: {
                unit: { connect: { id: unit.id } },
                index: index++,
              },
            },
          },
        });

        console.log(index, verb.spanish, conjugation.performer, conjugation.spanish);
      }
    }
  }
  for (const word of spanishWords["adjectives"]) {
    console.log(index++, word);
    const dbWord = await prisma.word.findFirst({
      where: { spanish: word, pos: { has: "ADJECTIVE" } },
    });

    if (!dbWord) misseds.push(word);
    else if (dbWord.spanish != word) console.log("[MISMATCH]", word, dbWord.spanish);
    else {
      const unit = await prisma.unit.findFirst({
        where: { corpusId: dbWord.id },
      });

      const curriculum = await prisma.curriculum.update({
        where: {
          id: curriculumId,
        },
        data: {
          unitRelations: {
            create: {
              unit: { connect: { id: unit.id } },
              index: unit.data.index,
            },
          },
        },
      });
    }
  }
}
await curriculum(curriculumId);
console.log(misseds);

async function createGames(curriculumId, maskId) {
  const translations = await prisma.game.create({
    data: {
      type: "TRANSLATIONS",
      curriculumRelation: {
        create: {
          curriculum: { connect: { id: curriculumId } },
          mask: { connect: { id: maskId } },
        },
      },
    },
  });
  const flashcards = await prisma.game.create({
    data: {
      type: "FLASHCARDS",
      curriculumRelation: {
        create: {
          curriculum: { connect: { id: curriculumId } },
          mask: { connect: { id: maskId } },
        },
      },
    },
  });
}
async function createMask() {
  const create = await prisma.mask.create({
    data: {
      data: {},
    },
  });
  console.log("mask id", create.id);
  return create.id;
}
async function createCurriculum() {
  const create = await prisma.curriculum.create({
    data: {
      name: curriculumName,
    },
  });
  console.log("curriculum id", create.id);
  return create.id;
}

// await createGames(await createCurriculum(), await createMask());

async function createAdditionalCorpus() {
  const pronouns = await prisma.word.create({
    data: {
      createdAt: "2023-09-29T18:22:40.919Z",
      updatedAt: "2024-01-07T10:05:18.225Z",
      index: 1650000,
      spanish: "nosotras",
      english: "we (f)",
      type: "PRON",
      pos: ["PRONOUN"],
      lemmaSpanish: null,
      lemmaEnglish: null,
      ud: {
        text: "nosotros",
        upos: "PRON",
        xpos: "pp1mp000",
        feats: {
          Gender: "Feminine",
          Number: "Plural",
          Person: "First",
          PronType: "Personal",
          udFeats: "Gender=Fem|Number=Plur|Person=1|PronType=Prs",
        },
      },
      usageInSpanish: "ábrenos! somos nosotras",
      usageInEnglish: "open up! it’s us",
      data: {
        type: "pron",
        index: "165",
        english: "we (f)",
        spanish: "nosotras",
        frequency: "6985 | 944327 +o",
        type_enums: "PRON",
        type_decoded: "pronoun",
        used_english: "open up! it’s us",
        used_spanish: "ábrenos! somos nosotras",
        frequency_web: 944327,
        frequency_genre: 6985,
      },
    },
  });
}
// await create();
