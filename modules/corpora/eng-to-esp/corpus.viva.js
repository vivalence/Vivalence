import curriculum from "./curriculum/index.js";
import schema from "./schema/index.js";

// async function install(runtime) {let { units, tags } = predictables(runtime); return false; const [annotations, unitRest] = units.reduce((acc, unit) => (unit.annotation ? acc[0].push(unit.annotation) : acc[1].push(unit), acc), [[], []],); const [ontologies, tagRest] = tags.reduce((acc, tag) => (tag.ontology ? acc[0].push(tag.ontology) : acc[1].push(tag), acc), [[], []],); const issues = (await Promise.all([runtime.call("/diagnostics/predict/tags", { ontologies }), runtime.call("/diagnostics/predict/units", { annotations }),])).flat(); const remedies = []; for (const issue of issues) {const remedy = await runtime.call("/remedy", { issue }); remedies.push(remedy);} return remedies.every((remedy) => remedy.resolved) && [...tagRest, ...unitRest].length === 0;}

const manifest = {
  type: "corpus",
  slug: "cefr-eng-to-esp",
  name: "CEFR - English to Spanish",
  icon: { emoji: "🇪🇺" },
  version: "0.0.2x",
};

const modules = {
  games: [
    //
    "@vivalence/game/conjugations",
    "@vivalence/game/flashcards",
    "@vivalence/game/translations",
    "@vivalence/game/prose",
  ],
  tactics: [
    //
    "@vivalence/tactic/spaced-repetition",
    "@vivalence/tactic/article-practice",
    "@vivalence/tactic/verb-conjugation-practice",
    "@vivalence/tactic/pronominalization-practice",
  ],
  strategies: [],
};

export { curriculum, manifest, modules, schema };
