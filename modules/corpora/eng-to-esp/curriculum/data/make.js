// import units from "./units.js";
// import fs from "node:fs";

// function makeStructurals() {
//   const vocabulary = units
//     // .filter((unit) => ["noun", "adj"].includes(unit.annotation.pos))
//     .filter((unit) => unit.data.index < 300);

//   // console.log(vocabulary[0], vocabulary.length);
//   // console.log(vocabulary.filter((unit) => unit.annotation.pos === "noun").length);
//   // console.log(vocabulary.filter((unit) => unit.annotation.pos === "adj").length);

//   const tag = {
//     name: `Vocabulary: A1`,
//     slug: `vocabulary:a1`,
//     data: {
//       COMPLETABLE: { type: "BAYESIAN", flavor: "INDIVIDUAL" },
//       STRUCTURAL: {
//         relations: {
//           units: vocabulary.map((unit) => ({ slug: unit.slug })),
//         },
//       },
//     },
//     traits: ["COMPLETABLE", "STRUCTURAL"],
//   };

//   const currentDir = new URL(".", import.meta.url).pathname;
//   const filePath = `${currentDir}/tags/structural.js`;
//   fs.unlinkSync(filePath);
//   fs.writeFileSync(filePath, `export default ${JSON.stringify([tag])};`);
// }
// makeStructurals();

// function makeLemmas() {
//   const verbs = units
//     .filter((unit) => ["verb", "adverb"].includes(unit.annotation.pos))
//     .filter((unit) => unit.data.index < 400);
//   const lemmas = Array.from(new Set(verbs.map((verb) => verb.annotation.lemma))).map((lemma) => ({
//     name: `Lemma: ${lemma}`,
//     slug: `lemma:${lemma}`,
//     data: {
//       ONTOLOGICAL: { branch: "lemma", leaf: lemma },
//       COMPLETABLE: { type: "BAYESIAN", flavor: "INDIVIDUAL" },
//     },
//     traits: ["ONTOLOGICAL", "COMPLETABLE", "STRUCTURAL"],
//   }));
//   console.log(lemmas[0], lemmas.length);
//   const currentDir = new URL(".", import.meta.url).pathname;
//   const filePath = `${currentDir}/tags/lemmas.js`;
//   fs.unlinkSync(filePath);
//   fs.writeFileSync(filePath, `export default ${JSON.stringify(lemmas)};`);
// }

// import units from "./units.bak.js";
// import fs from "node:fs";

// function makeUnits() {
//   const vocabulary = new Map();
//   for (const unit of units.sort((a, b) => a.index - b.index)) {
//     if (!vocabulary.has(unit.annotation.pos)) {
//       vocabulary.set(unit.annotation.pos, []);
//     }
//     vocabulary.get(unit.annotation.pos).push(unit);
//   }

//   const currentDir = new URL(".", import.meta.url).pathname;

//   for (const [pos, units] of vocabulary) {
//     const filePath = `${currentDir}/units/${pos}.js`;
//     fs.unlinkSync(filePath);
//     fs.writeFileSync(filePath, `export default ${JSON.stringify(units)};`);
//   }

//   let file = ``;
//   for (const [pos, units] of vocabulary) {
//     file += `import ${pos} from "./units/${pos}.js";\n`;
//   }
//   file += `\nexport default [`;
//   for (const [pos, units] of vocabulary) {
//     file += `\n...${pos},`;
//   }
//   file += `\n];`;
//   fs.unlinkSync(`${currentDir}/units.js`);
//   fs.writeFileSync(`${currentDir}/units.js`, file);
// }

// makeUnits();
