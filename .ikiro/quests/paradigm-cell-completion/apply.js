// paradigm-cell-completion / apply.js
//
// Patches verb.js + conjugation.js to install thirdSingular cells across
// imperfect.indicative / conditional / present.subjunctive paradigms.
// Reads specs.js for the 39 hand-composed entries + 1 modify + 40 bundle wires.
//
// Run: deno run --allow-read --allow-write apply.js

import { NEW_3SG, MODIFY_1SG, BUNDLES_TO_PATCH } from "./specs.js";

const ROOT = "registry/kernels/@vivalence/corpus/english-to-brazilian/dataset/literals";
const VERB_PATH = `${ROOT}/words/verb.js`;
const CONJ_PATH = `${ROOT}/conjugation.js`;

function parseEntities(text) {
  const body = text.replace(/^export default\s+/, "").trimEnd().replace(/;$/, "");
  return JSON.parse(body);
}

function writeEntities(path, entities) {
  const body = JSON.stringify(entities, null, 2);
  return Deno.writeTextFile(path, `export default ${body}\n`);
}

function buildWordSlug(lemma, mood, tense, person, number) {
  const parts = [lemma, "verb", mood];
  if (tense) parts.push(tense);
  parts.push(person, number);
  return parts.join(".");
}

function build3sgEntry(template, spec) {
  const slug3 = buildWordSlug(spec.lemma, spec.mood, spec.tense, "third", "singular");
  const clone = structuredClone(template);
  clone.slug = slug3;
  clone.trait.TRANSLATED.known = spec.knownEN;
  clone.trait.TRANSLATED.learning = spec.form;
  clone.trait.EXEMPLIFIED.known = spec.exampleEN;
  clone.trait.EXEMPLIFIED.learning = spec.examplePT;
  // strip VOCALIZED — audio not yet generated for new 3sg entries
  if (clone.traits.includes("VOCALIZED")) {
    clone.traits = clone.traits.filter((t) => t !== "VOCALIZED");
    delete clone.trait.VOCALIZED;
  }
  // swap person.first → person.third
  clone.symbols = clone.symbols.map((s) =>
    s.slug === "word.person.first" ? { slug: "word.person.third" } : s,
  );
  return clone;
}

function buildBundleParadigm(lemma, bundleSlug) {
  // bundleSlug maps to (mood, tense) for word slug construction
  if (bundleSlug.endsWith(".imperfect.indicative")) {
    return { mood: "indicative", tense: "imperfect" };
  }
  if (bundleSlug.endsWith(".conditional")) {
    return { mood: "conditional", tense: null };
  }
  if (bundleSlug.endsWith(".present.subjunctive")) {
    return { mood: "subjunctive", tense: "present" };
  }
  throw new Error(`unmapped bundle slug: ${bundleSlug}`);
}

// ── load ────────────────────────────────────────────────────────────
const verbText = await Deno.readTextFile(VERB_PATH);
const conjText = await Deno.readTextFile(CONJ_PATH);
const verbs = parseEntities(verbText);
const bundles = parseEntities(conjText);

const verbBySlug = new Map(verbs.map((e) => [e.slug, e]));
const verbIndexBySlug = new Map(verbs.map((e, i) => [e.slug, i]));
const bundleBySlug = new Map(bundles.map((e) => [e.slug, e]));

// ── insert / wire 3sg word literals ─────────────────────────────────
const inserts = [];  // { afterIndex, entry }
let wireOnlyCount = 0;
let insertCount = 0;

for (const spec of NEW_3SG) {
  const slug1sg = buildWordSlug(spec.lemma, spec.mood, spec.tense, "first", "singular");
  const slug3sg = buildWordSlug(spec.lemma, spec.mood, spec.tense, "third", "singular");
  if (spec.wireOnly) {
    if (!verbBySlug.has(slug3sg)) {
      throw new Error(`wireOnly spec but ${slug3sg} not in verb.js`);
    }
    wireOnlyCount++;
    continue;
  }
  if (verbBySlug.has(slug3sg)) {
    console.warn(`SKIP — ${slug3sg} already exists`);
    continue;
  }
  const template = verbBySlug.get(slug1sg);
  if (!template) throw new Error(`template missing: ${slug1sg}`);
  const entry = build3sgEntry(template, spec);
  inserts.push({ afterIndex: verbIndexBySlug.get(slug1sg), entry });
  insertCount++;
}

// Sort inserts by afterIndex DESCENDING so splices don't shift later indices
inserts.sort((a, b) => b.afterIndex - a.afterIndex);
for (const { afterIndex, entry } of inserts) {
  verbs.splice(afterIndex + 1, 0, entry);
}

// ── modify querer.conditional.1sg (quereria → queria, colloquial) ──
const mod = verbBySlug.get(MODIFY_1SG.slug);
if (!mod) throw new Error(`modify target missing: ${MODIFY_1SG.slug}`);
mod.trait.TRANSLATED.learning = MODIFY_1SG.newLearning;
mod.trait.TRANSLATED.known = MODIFY_1SG.newKnownEN;
mod.trait.EXEMPLIFIED.known = MODIFY_1SG.newExampleEN;
mod.trait.EXEMPLIFIED.learning = MODIFY_1SG.newExamplePT;
// Update RANKED to match `queria` surface form (looked up from existing imperfect entry)
const queriaRankSrc = verbBySlug.get("querer.verb.indicative.imperfect.first.singular");
mod.trait.RANKED = { ...queriaRankSrc.trait.RANKED };
// Strip VOCALIZED — audio was for `quereria`, not `queria`
if (mod.traits.includes("VOCALIZED")) {
  mod.traits = mod.traits.filter((t) => t !== "VOCALIZED");
  delete mod.trait.VOCALIZED;
}

// ── patch bundles: add thirdSingular cell ───────────────────────────
let bundleCount = 0;
for (const bundleSlug of BUNDLES_TO_PATCH) {
  const bundle = bundleBySlug.get(bundleSlug);
  if (!bundle) throw new Error(`bundle missing: ${bundleSlug}`);
  const { mood, tense } = buildBundleParadigm(bundle.slug.split(".")[0], bundleSlug);
  const lemma = bundle.slug.split(".")[0];
  const slug3sg = buildWordSlug(lemma, mood, tense, "third", "singular");
  const paradigm = bundle.trait.CONJUGATED.paradigm;
  if (paradigm.thirdSingular) {
    console.warn(`SKIP bundle ${bundleSlug} — already has thirdSingular`);
    continue;
  }
  // Reorder keys: firstSingular, thirdSingular, firstPlural, thirdPlural
  bundle.trait.CONJUGATED.paradigm = {
    firstSingular: paradigm.firstSingular,
    thirdSingular: slug3sg,
    firstPlural: paradigm.firstPlural,
    thirdPlural: paradigm.thirdPlural,
  };
  bundleCount++;
}

// ── verify all paradigm refs resolve ────────────────────────────────
const newVerbBySlug = new Map(verbs.map((e) => [e.slug, e]));
const unresolved = [];
for (const b of bundles) {
  const p = b.trait?.CONJUGATED?.paradigm ?? {};
  for (const [cell, slug] of Object.entries(p)) {
    if (!newVerbBySlug.has(slug)) {
      unresolved.push({ bundle: b.slug, cell, slug });
    }
  }
}
if (unresolved.length) {
  console.error("UNRESOLVED paradigm refs:");
  for (const u of unresolved) console.error(`  ${u.bundle} / ${u.cell} → ${u.slug}`);
  Deno.exit(1);
}

// ── write back ──────────────────────────────────────────────────────
await writeEntities(VERB_PATH, verbs);
await writeEntities(CONJ_PATH, bundles);

console.log(`✓ inserted ${insertCount} new 3sg word literals`);
console.log(`✓ wired ${wireOnlyCount} orphan(s) (no insert)`);
console.log(`✓ modified ${MODIFY_1SG.slug}`);
console.log(`✓ patched ${bundleCount} paradigm bundles`);
console.log(`✓ all paradigm refs resolve`);
