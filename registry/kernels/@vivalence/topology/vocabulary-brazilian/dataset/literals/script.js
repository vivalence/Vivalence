// import { readdirSync, existsSync } from "node:fs";
// import { join } from "node:path";
// import { pathToFileURL } from "node:url";

// const load = async (path) => {
//   const { default: data } = await import(pathToFileURL(path));
//   return Array.isArray(data) ? data.map((e) => e.slug) : [];
// };

// const wordsDir = "./words";
// const verbDir = join(wordsDir, "verb");

// const files = [
//   "./sentences.js",
//   ...readdirSync(wordsDir)
//     .filter((f) => f.endsWith(".js") && f !== "index.js")
//     .map((f) => join(wordsDir, f)),
//   ...(existsSync(verbDir)
//     ? readdirSync(verbDir)
//         .filter((f) => f.endsWith(".js") && f !== "index.js")
//         .map((f) => join(verbDir, f))
//     : []),
// ];

// const seen = new Map();

// for (const file of files) {
//   const slugs = await load(file);
//   for (const slug of slugs) {
//     const hits = seen.get(slug) ?? [];
//     hits.push(file);
//     seen.set(slug, hits);
//   }
// }

// const dupes = [...seen.entries()].filter(([, files]) => files.length > 1);

// if (dupes.length === 0) {
//   console.log("no duplicates");
// } else {
//   for (const [slug, files] of dupes) console.log(`${slug}\n  ${files.join("\n  ")}`);
// }
// import { readdirSync, writeFileSync, existsSync } from "node:fs";
// import { join } from "node:path";
// import { pathToFileURL } from "node:url";

// const POS = {
//   adj: "adjective",
//   adp: "adposition",
//   adv: "adverb",
//   cconj: "coordinating-conjunction",
//   det: "determiner",
//   intj: "interjection",
//   num: "numeral",
//   part: "particle",
//   pron: "pronoun",
//   sconj: "subordinating-conjunction",
// };

// const MOOD = { ind: "indicative", sub: "subjunctive", imp: "imperative", cond: "conditional" };
// const TENSE = {
//   pres: "present",
//   past: "past",
//   impf: "imperfect",
//   fut: "future",
//   plup: "pluperfect",
// };
// const PERSON_NUMBER = {
//   "1sg": "first.singular",
//   "2sg": "second.singular",
//   "3sg": "third.singular",
//   "1pl": "first.plural",
//   "2pl": "second.plural",
//   "3pl": "third.plural",
// };

// const expandSlug = (slug) => {
//   const parts = slug.split(".");

//   if (parts[1] === "verb") {
//     const [lemma, , mood, tense, persnum] = parts;
//     return [
//       lemma,
//       "verb",
//       MOOD[mood] ?? mood,
//       TENSE[tense] ?? tense,
//       PERSON_NUMBER[persnum] ?? persnum,
//     ]
//       .filter(Boolean)
//       .join(".");
//   }

//   const pos = POS[parts[parts.length - 1]];
//   if (pos) return [...parts.slice(0, -1), pos].join(".");

//   return slug;
// };

// const processFile = async (path) => {
//   const { default: lits } = await import(pathToFileURL(path));
//   const updated = lits.map((l) => ({ ...l, slug: expandSlug(l.slug) }));
//   writeFileSync(path, `export default ${JSON.stringify(updated, null, 2)};\n`);
//   console.log(`${path} (${updated.length})`);
// };

// const wordsDir = "./words";

// const posFiles = readdirSync(wordsDir)
//   .filter((f) => f.endsWith(".js") && f !== "index.js")
//   .map((f) => join(wordsDir, f));

// const verbDir = join(wordsDir, "verb");
// const verbFiles = existsSync(verbDir)
//   ? readdirSync(verbDir)
//       .filter((f) => f.endsWith(".js") && f !== "index.js")
//       .map((f) => join(verbDir, f))
//   : [];

// for (const f of [...posFiles, ...verbFiles]) await processFile(f);
