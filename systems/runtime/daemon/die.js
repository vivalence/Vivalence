import { is, Wafer, Blacklist } from "@vivalence/typology";
import { raw } from "@mikro-orm/sqlite";

import * as lifecycle from "./lifecycle/index.js";
import * as kernel from "./kernel/index.js";
import * as aperture from "./aperture/index.js";

import { object } from "@vivalence/typology";

export class Die extends Wafer {
  register = {
    lighthouse: null,
    hallucinator: null,
    datamap: null,
    kernel: [],
    modes: [],
    services: [],
  };

  variant = {
    kernel: {},
    modes: [],
    traits: {},
    entities: [],
    services: {},
  };

  async populate() {
    await lifecycle.population.core(this);
    lifecycle.population.wiring(this);
    await lifecycle.population.datamap(this);
    await lifecycle.population.authority(this);
    await lifecycle.population.acid(this);
    await lifecycle.population.modes(this);
    await lifecycle.population.twitch(this);
    await lifecycle.population.handlers(this);
    await lifecycle.population.services(this);
  }

  async resolve() {
    await kernel.topography(this);
    await kernel.schema(this);
    await kernel.constraints(this);
    kernel.validation(this);
    kernel.asserter(this);
    await kernel.classifier(this);

    await lifecycle.resolution.kernel(this);
    await lifecycle.resolution.modes(this);

    await aperture.datamap(this);
    await aperture.userspace(this);
    // await aperture.kernel(this);
    await aperture.modes(this);
  }

  async integrate() {
    await lifecycle.integration.call(this);
    await lifecycle.integration.uninstall(this);

    await test(this);

    this.status.set("alive");
  }

  async disintegrate() {
    // todo: refactor to abort controller
    await this.good.kernel.orm?.close?.();
    // await sleep(1);
    this.status.set("stopped");
  }
}

async function test(daemonDie) {
  // const play = await daemonDie.good.entities.play.find();
}

const QUERY = {
  batch: 1,
  stock: 1,
  seek: {
    symbols: [
      {
        id: "019cc6aa-9232-779e-8cdb-a7a3519dbffe",
      },
    ],
  },
  scope: {
    commissioner: "019cc6aa-917b-7496-8c69-0a4c0f3db157",
    session: "019cc5fa-305b-74d8-b228-efa9269422b7",
    valence: "019cc6aa-ac24-766e-bc75-6a2835322a6e",
    user: "019af285-bcd6-70cc-97ca-8a1aa4193320",
  },
  blacklist: {
    literals: [
      "019cc6aa-932e-77f7-a276-90a64af874db",
      "019cc6aa-934a-746e-9b2a-ff141bff343b",
      "019cc6aa-9296-746a-ac04-ff8e4dd5918d",
      "019cc6aa-92de-740b-8f6e-e5cb5e2bd2a7",
    ],
    symbols: [],
    products: [],
  },
};

// const literal = {slug: "lemma.gato:pos.noun:gender.masc:number.sing", traits: ["EXEMPLIFIED", "TRANSLATED"], annotation: {pos: "noun", lemma: "gato", gender: "masc", number: "sing",}, data: {TRANSLATED: {known: "cat", learning: "gato",}, EXEMPLIFIED: {known: "The cat is small", learning: "O gato é pequeno",},},};
// const subjects = await daemonDie.good.entities.subject.find();
// const dimensions = await daemonDie.good.entities.dimension.find();
// console.json(daemonDie.good.schema.literals.noun);
// console.log({ schema: { annotation: daemonDie.good.schema.annotations.noun } });
// console.log(daemonDie.good.assert);
// console.log(daemonDie.good.validate);
//

// let issues = await daemonDie.good.validate.literal(literal, [
//   // "SCHEMATIC",
//   // "EXISTENTIAL",
//   "RELATIONAL",
// ]);

// // console.json({ intemediary: issues });

// if (!is.empty(issues)) {
//   issues = await daemonDie.good.kernel.medic.many(issues, {
//     daemon: daemonDie.good,
//   });
// }

// console.json({ result: issues });
// const literal = { id: "019c39b4-8eed-73d8-b5a5-aaef0fa4282e" }; async function BLACKLIST(daemonDie) {const result = await daemonDie.good.entities.literal.findOne(literal, {populate: ["symbols"],}); console.json({ result });}
// // const literal = {id: "019c1cd5-a5da-7125-9e4d-1fc10af7d23a", slug: "lemma:hola-pos:noun-gender:fem-number:sing", name: null, description: null, annotation: { lemma: "hola", pos: "noun", gender: "fem", number: "sing" }, data: {known: "hello", learning: "hola", index: 1, example: { known: "Hello, how are you?", learning: "Hola, ¿cómo estás?" },}, symbols: [],};
// const literal = {
//   id: "019c39b4-8ecf-724a-8e45-363e0158c12a",
//   slug: "estar-pos:verb-verbform:fin-suffix:ar-tense:pres-mood:ind-person:1-number:sing",
//   symbols: [
//     // { id: "019bfcd0-3ab2-71aa-99b6-986aa3f629d1", slug: "pos:verb" },
//     { id: "019c38d0-37ea-773c-9650-046ad7b85735", slug: "lemma:estar" },
//     // { id: "019c1d6c-3e3f-71fc-91de-e03980a517ad", slug: "suffix:ar" },
//     // { id: "019c1d6c-3e3b-74a8-875c-588731c52988", slug: "verbform:fin" },
//     {
//       id: "019c1d6c-3e37-74ba-bd86-c70d8d5956f6",
//       slug: "tense:pres",
//     },
//     {
//       id: "019c1d6c-3e32-7009-a61d-fe974b4cee28",
//       slug: "mood:ind",
//     },
//     // {"id": "019c43a8-0f85-704e-9b9f-336a379256b5", "slug": "person:1"}, {"id": "019bfccd-c773-7302-a7fa-8de0d228abdd", "slug": "number:sing"}, {"id": "019c43a8-7eff-7598-890c-3929f379adb7", "slug": "aspect:*"}
//   ],
// };
// async function QUERY(daemonDie) {
//   const literals = await daemonDie.good.entities.literal.find(
//     {
//       $and: [
//         { symbols: { $in: [literal.symbols[0].id, "bogus-id-123"] } },
//         { symbols: literal.symbols[1].id },
//         { symbols: literal.symbols[2].id },
//       ],
//     },
//     {
//       limit: 6,
//       fields: ["id", "slug", "symbols.id", "symbols.slug"],
//       populate: ["symbols"],
//     },
//   );
//   console.json({ literals });
//   console.log(literals.length);
// }

// async function QUERY(daemonDie) {const literals = await daemonDie.good.entities.literal.find({$and: [{ symbols: { $in: [literal.symbols[2].id, "bogus-id-123"] } }, { symbols: literal.symbols[0].id }, { symbols: literal.symbols[1].id },],}, {limit: 1, fields: ["id", "slug", "symbols.id", "symbols.slug"], populate: ["symbols"],},); console.json({ literals });}
// async function QUERY(daemonDie) {
//   const verbs = await daemonDie.good.entities.literal.find(
//     {
//       $and: [
//         { symbols: { $in: verb.symbols } },
//         // { symbols: { $in: [seek.symbols.tense] } },
//         // { symbols: seek.symbols.mood },
//       ],
//     },
//     {
//       limit: 1,
//     },
//   );

//   console.json({ verbs });
// }

// const literal = {slug: "el-det-fem-sing", data: {known: "the", learning: "la", index: 1, example: {known: "the house", learning: "la casa",},}, annotation: {lemma: "el", pos: "det", definite: "def", gender: "fem", number: "sing", prontype: "art",},};
// const annotation = literal.annotation; let issues = await this.good.validate.annotation(annotation, ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL"],);
// let verbs = await this.good.entities.literal.find({[raw(`json_extract(annotation, '$.pos')`)]: "verb", [raw(`json_extract(annotation, '$.verbform')`)]: { $ne: "inf" },}, {limit: 1, fields: ["id", "slug", "symbols.id", "symbols.slug"], populate: ["symbols"],},); console.json({ verbs });
// for (const verb of verbs) {
//   let issues = await this.good.validate.literal(verb, [
//     // "SCHEMATIC",
//     // "EXISTENTIAL",
//     "RELATIONAL",
//   ]);

//   console.log(issues.length);

//   if (!is.empty(issues)) {
//     issues = await this.good.kernel.medic.many(issues, {
//       daemon: this.good,
//     });
//   }

//   console.json({ issues: issues });
//   // console.json({ issues, verb });
// }
// let issues = await this.good.validate.annotation(literal.annotation, ["SCHEMATIC", "EXISTENTIAL", "RELATIONAL",]);
// issues = await this.good.kernel.medic.many(issues, {
//   daemon: this.good,
// });
// console.json({ remedied: issues });

// console.log(
//   "TEST @runtime/daemon/die",
//   this,
//   await this.good.entities.dimension.find({}, { limit: 2 }),
//   await this.good.entities.subject.find({}, { limit: 2 }),
//   await this.good.entities.symbol.find({}, { limit: 2 }),
//   await this.good.entities.literal.find({}, { limit: 2 }),
// );
// console.log("TEST @runtime/daemon/die", { daemon: this.good });
// console.log("TEST @runtime/daemon/die", this.good.classify);
// const literal = await this.good.entities.literal.findOne({annotation: { lemma: annotation.lemma },}); console.log("tested annotation validation", { literal }); const result = await this.good.validate.literal(literal, ["RELATIONAL"]); console.log("tested annotation validation", { result });

// const result = await this.good.classify.text("el autobus es rocho");
// const annotation = {lemma: "autobús", pos: "noun", gender: "masc", number: "sing",};
// const result = await this.good.assert.annotation(annotation, ["RELATIONAL", "EXISTENTIAL",]);
// console.log("@daemonDie", { result });

// await QUERY(this);
