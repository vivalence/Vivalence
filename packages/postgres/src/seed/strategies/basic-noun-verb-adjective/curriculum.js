import fs from "fs";
// import { PrismaClient } from "@prisma/client";
// import nlp from "../../../../src/services/nlp/index.js";
import supabase from "../../../../src/clients/supabase.js";
import { fetchData } from "../../../../src/clients/pg.js";

const spanishWords = {
  nouns: [
    "pan",
    "agua",
    "fruta",
    "verdura",
    "carne",
    "pescado",
    "leche",
    "queso",
    "huevo",
    "arroz",
    "pasta",
    "sopa",
    "ensalada",
    "azúcar",
    "enfermero",
    "ingeniero",
    "abogado",
    "abogada",
    "médico",
    "médica",
    "cocinero",
    "policía",
    "vendedor",
    "periodista",
    "arquitecto",
    "sal",
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
    "amigo",
    "madre",
    "padre",
    "hermano",
    "maestro",
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
    "inteligente",
    "simpático",
    "simpática",
    "perezoso",
    "perezosa",
    "amable",
    "curioso",
    "curiosa",
    "generoso",
    "generosa",
    "serio",
    "seria",
    "tímido",
    "tímida",
    "valiente",
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
    "gustar",
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
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const BATCHSIZE = 100;
const BATCHINTERVAL = 10000;

async function tag_a1() {
  const words = spanishWords.nouns.concat(
    spanishWords.adjectives,
    spanishWords.verbs,
  );
  console.log("words", words.length);

  let query = supabase
    .from("Unit")
    .select("*")
    .eq("corpusType", "WORD")
    .in("data->>spanish", words);

  const { data: units, error, status, count } = await query;
  console.log("units", status, error, count, units.length);

  const tag = await supabase
    .from("Tag")
    .insert([{ name: "A1", type: ["STRUCTURAL"] }])
    .select();

  console.log("tag", tag);
  const tagId = tag.data[0].id;
  console.log("tagId", tagId);

  for (const unit of units) {
    const { data, error, status } = await supabase
      .from("_TagToUnit")
      .insert([{ B: unit.id, A: tagId }]);
    console.log("tag to unit", status, error, data);
  }
}
// await tag_a1();

async function tags_upos() {
  const START = 0;
  const TAKE = 5000;
  let index = START;

  const query = `
SELECT DISTINCT ON (data->'ud'->>'upos') 
       unit.*
FROM public."Unit" AS unit
WHERE unit.data->'ud' ? 'upos'
ORDER BY unit.data->'ud'->>'upos', unit."createdAt";

  `;
  const result = await fetchData(query);
  console.log("results", result.length);
  // console.log(
  //   result.map((unit) => ({
  //     type: "{ONTOLOGICAL}",
  //     name: unit.data.ud.upos,
  //   })),
  // );
  // return;
  const LIST = ["NOUN", "VERB"];
  const { data, error, status } = await supabase.from("Tag").upsert(
    result
      .filter((unit) => LIST.includes(unit.data.ud.upos) === false)
      .map(
        (unit) => ({
          type: "{ONTOLOGICAL}",
          name: unit.data.ud.upos,
        }),
        {
          ignoreDuplicates: false,
        },
      ),
  );
  console.log("insert", status, error, data);
}
async function tags_upos_relations() {
  const START = 0;
  const TAKE = 5000;
  let index = START;

  const query = `
SELECT unit.*
FROM public."Unit" AS unit
WHERE unit.data->'ud' ? 'upos'
ORDER BY unit."createdAt";
`;

  const result = await fetchData(query);
  console.log("results", result.length);

  const promises = [];

  for (const unit of result) {
    promises.push(
      (async (unit, index) => {
        try {
          const { data } = await supabase
            .from("Tag")
            .select("*")
            .eq("name", unit.data.ud.upos)
            .single();

          await supabase.from("_TagToUnit").upsert(
            {
              A: data.id,
              B: unit.id,
            },
            {
              ignoreDuplicates: false,
            },
          );
        } catch (error) {
          if (error.code === "P2002") {
          } else {
            console.log("ERROR", error);
          }
        }
      })(unit, index),
    );
    if (index++ % BATCHSIZE === BATCHSIZE - 1) {
      console.log(
        `batch launched ${index / BATCHSIZE} / ${result.length / BATCHSIZE}`,
      );
      await sleep(BATCHINTERVAL);
    }
  }
  await Promise.all(promises);
}
await tags_upos_relations();

async function tags_ontological() {
  const START = 0;
  const TAKE = 5000;
  let index = START;

  const query = `
  SELECT
    tag.*

  FROM public."Tag" tag

  ORDER BY tag."createdAt" ASC
  OFFSET ${START}
  LIMIT ${TAKE};
  `;
  const result = await fetchData(query);
  console.log("results", result.length, result[0]);

  const { data, error, status } = await supabase.from("Tag").insert(
    result.map((tag) => ({
      id: tag.id,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      type: "{ONTOLOGICAL}",
      name: tag.name,
      data: tag.data,
    })),
  );
  console.log("insert", status, error, data);
  //
}
// await tags_ontological();

async function tags_ontological_relations() {
  const START = 0;
  const TAKE = 50000000;
  let index = START;
  const query = `
  SELECT
    tag.*,
    relation."A" AS "relationTagId",
    relation."B" AS "relationUnitId"

  FROM public."Tag" tag

  INNER JOIN public."_TagToUnit" relation ON tag.id = relation."A"

  ORDER BY tag."createdAt" ASC
  OFFSET ${START}
  LIMIT ${TAKE};
  `;
  const result = await fetchData(query);
  console.log("results", result.length, result[0]);

  const insertQuery = `
  INSERT INTO public."_TagToUnit" ("A", "B")
  VALUES 
  ${result.map((tag) => `('${tag.relationTagId}', '${tag.relationUnitId}')`).join(", ")}
  ON CONFLICT ("A", "B") DO NOTHING;
`;
  // console.log(insertQuery);
  // write query to file tmp.sql
  fs.writeFileSync("tmp.sql", insertQuery);
}
// await tags_ontological_relations();

async function units() {
  const START = 0;
  const TAKE = 100000;
  let index = START;

  const query = `
SELECT * FROM public."Unit"
ORDER BY "createdAt" ASC
OFFSET ${START}
LIMIT ${TAKE};
`;
  const result = await fetchData(query);
  console.log("results", result.length);

  const promises = [];

  for (const unit of result) {
    promises.push(
      (async (unit, index) => {
        try {
          const upsert = await supabase
            .from("Unit")
            .update({ data: unit.data })
            .eq("id", unit.id);

          if (upsert.error) console.log("[UPSERT ERROR]", upsert.error);
          else console.log("[UPSERT]", index);
        } catch (error) {
          if (error.code === "P2002") {
          } else {
            console.log("ERROR", error);
            throw error;
          }
        }
      })(unit, index),
    );
    if (index++ % BATCHSIZE === 0) {
      console.log(
        `batch launched ${index / BATCHSIZE} / ${result.length / BATCHSIZE}`,
      );
      await sleep(BATCHINTERVAL);
    }
  }
  await Promise.all(promises);
}
// await units();

async function memory() {
  const START = 0;
  const TAKE = 10000;
  let index = START;

  const query = `
SELECT * FROM public."MemoryModel"
ORDER BY "createdAt" ASC
OFFSET ${START}
LIMIT ${TAKE};
`;
  const result = await fetchData(query);
  console.log("results", result.length);

  const promises = [];
  for (const unit of result) {
    promises.push(
      (async (data, index) => {
        try {
          const upsert = await supabase
            .from("MemoryModel")
            .update({
              updatedAt: data.updatedAt,
              lastSeen: data.lastSeen,
              history: data.history,
              type: data.type,
              status: data.status,
              state: data.state,
            })
            .eq("id", data.id);

          if (upsert.error) console.log("[UPSERT ERROR]", upsert.error);
          // else console.log("[UPSERT]", index);
        } catch (error) {
          if (error.code === "P2002") {
          } else {
            console.log("ERROR", error);
            throw error;
          }
        }
      })(unit, index),
    );
    if (index++ % BATCHSIZE === 0) {
      console.log(
        `batch launched ${index / BATCHSIZE} / ${result.length / BATCHSIZE}`,
      );
      await sleep(BATCHINTERVAL);
    }
  }
  await Promise.all(promises);
}
// await memory();

async function plays() {
  const START = 0;
  const TAKE = 1000000;
  let index = START;
  //   const query = `
  //   SELECT *
  // FROM public."GameUnitRelation"
  // ORDER BY "createdAt" ASC
  // OFFSET ${START} LIMIT ${TAKE};
  // `;

  const query = `
  SELECT
  gur.*,
  mm.id AS "memoryId"

  FROM public."GameUnitRelation" gur
  INNER JOIN public."Unit" u ON gur."unitId" = u.id
  INNER JOIN public."MemoryModel" mm ON u.id = mm."unitId"
  ORDER BY gur."createdAt" ASC
  OFFSET ${START}
  LIMIT ${TAKE};
  `;
  const result = await fetchData(query);
  console.log("results", result.length, result[0]);

  const promises = [];
  for (const unit of result) {
    promises.push(
      (async (data, index) => {
        try {
          const upsert = await supabase
            .from("Play")
            .update({
              nextPlay: data.nextPlay,
              lastPlay: data.lastPlay,
              history: data.history,
              updatedAt: data.updatedAt,
            })
            .eq("id", data.id);

          if (upsert.error) console.log("[UPSERT ERROR]", upsert.error);
          // else console.log("[UPSERT]", index);
        } catch (error) {
          if (error.code === "P2002") {
          } else {
            console.log("ERROR", error);
            throw error;
          }
        }
      })(unit, index),
    );
    if (index++ % BATCHSIZE === 0) {
      console.log(
        `batch launched ${index / BATCHSIZE} / ${result.length / BATCHSIZE}`,
      );
      await sleep(BATCHINTERVAL);
    }
  }
  await Promise.all(promises);

  // const upsert = await supabase.from("Play").upsert(
  //   result.map((r) => ({
  //     id: r.id,
  //     createdAt: r.createdAt,
  //     updatedAt: r.updatedAt,
  //     nextPlay: r.nextPlay,
  //     lastPlay: r.lastPlay,
  //     history: r.history,
  //     gameId: r.gameId,
  //     unitId: r.unitId,
  //     memoryId: r.memoryId,
  //     userId: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b",
  //   })),
  // );
}
// await plays();
// async function games() {const translations = await prisma.game.create({data: {type: "TRANSLATIONS", curriculumRelation: {create: {curriculum: { connect: { id: "clqcnpxn40000g04jxtgskgrx" } }, mask: { connect: { id: "clpr5668n0002g01pnxhkh8nf" } },},},},}); const flashcards = await prisma.game.create({data: {type: "FLASHCARDS", curriculumRelation: {create: {curriculum: { connect: { id: "clqcnpxn40000g04jxtgskgrx" } }, mask: { connect: { id: "clq0z4qxv0002g0f8f93uwkc4" } },},},},});} await games();

// console.log("curriculum", curriculum);
