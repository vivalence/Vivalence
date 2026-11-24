// QA fixup pass — addresses anomalies found by parallel QA agents.
//
// 1. querer.cond.3sg RANKED stale (still pointing at quereria stats);
//    must mirror 1sg `queria` stats.
// 2. ter.imperfect.3sg symbols drift vs 1sg sibling — missing
//    proficiency.high-frequency, functional.grammar, functional.auxiliary.
// 3. ter.subj.present.3sg same drift + has stray proficiency.survival
//    (1sg lacks it) + cosmetic rank 3981 vs 3984.
// 4. poder.subj.present.3sg missing functional.modal.
// 5. querer.cond.3sg example polish — different scene from 1sg restaurant.

const ROOT = "registry/kernels/@vivalence/corpus/english-to-brazilian/dataset/literals";
const VERB_PATH = `${ROOT}/words/verb.js`;

function parseEntities(text) {
  const body = text.replace(/^export default\s+/, "").trimEnd().replace(/;$/, "");
  return JSON.parse(body);
}
function writeEntities(path, entities) {
  return Deno.writeTextFile(path, `export default ${JSON.stringify(entities, null, 2)}\n`);
}

const verbs = parseEntities(await Deno.readTextFile(VERB_PATH));
const bySlug = new Map(verbs.map((e) => [e.slug, e]));

function addSymbol(entry, slug) {
  if (!entry.symbols.some((s) => s.slug === slug)) {
    entry.symbols.push({ slug });
  }
}
function removeSymbol(entry, slug) {
  entry.symbols = entry.symbols.filter((s) => s.slug !== slug);
}

// 1. querer.cond.3sg RANKED + example polish
const q3 = bySlug.get("querer.verb.conditional.third.singular");
q3.trait.RANKED = { rank: 2951, zipf: 5.53, fpm: 339 };
q3.trait.EXEMPLIFIED.known = "She would like to speak with the manager";
q3.trait.EXEMPLIFIED.learning = "Ela queria falar com o gerente";

// 2. ter.imperfect.indicative.3sg symbol alignment with 1sg
const tImp3 = bySlug.get("ter.verb.indicative.imperfect.third.singular");
addSymbol(tImp3, "proficiency.high-frequency");
addSymbol(tImp3, "functional.grammar");
addSymbol(tImp3, "functional.auxiliary");

// 3. ter.subj.present.3sg symbol alignment + cosmetic rank
const tSub3 = bySlug.get("ter.verb.subjunctive.present.third.singular");
addSymbol(tSub3, "proficiency.high-frequency");
addSymbol(tSub3, "functional.grammar");
addSymbol(tSub3, "functional.auxiliary");
removeSymbol(tSub3, "proficiency.survival");
tSub3.trait.RANKED.rank = 3984;

// 4. poder.subj.present.3sg
const pSub3 = bySlug.get("poder.verb.subjunctive.present.third.singular");
addSymbol(pSub3, "functional.modal");

await writeEntities(VERB_PATH, verbs);
console.log("✓ querer.cond.3sg RANKED + example fixed");
console.log("✓ ter.imperfect.3sg symbols aligned");
console.log("✓ ter.subj.3sg symbols aligned + rank cosmetic");
console.log("✓ poder.subj.3sg symbols aligned");
