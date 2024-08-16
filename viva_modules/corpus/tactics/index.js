const tactic = {
  name: "Morphology of gender and number",
  slug: "morphology-of-gender-and-number",
  description:
    "Learn how to properly use gender and number of vocabulary by repetition of flashcards.",
  relations: {
    units: {},
    tags: {
      structural: { slug: "structural:a1" },
      articles: { slug: "prontype:art" },
      vocabulary: [{ slug: "pos:noun" }, { slug: "pos:adj" }],
    },
    games: {
      flashcards: { slug: "flashcards" },
      translations: { slug: "translations" },
    },
  },
  masks: {
    translations: {
      prompt: {
        inner:
          "### Task:\nCreate simple statements to practice the usage of present tense verbs with a noun for A1 language learners.\nUsage of present tense verbs and nouns on A1 level.\n1 VERB + 1 NOUN\n\n### Examples:\nHe eats bread. - Él come pan. (Masculine Singular)\nShe reads a book. - Ella lee un libro. (Feminine Singular)\nThey play soccer. - Ellos juegan fútbol. (Masculine Plural)\n\n### Instructions:\nThe sentence should be made up of 2 parts. One (1) verb in the present tense and one (1) noun.\nChoose common, everyday nouns suitable for A1 level language learners.\nThe statement must make sense, possibly occur in written text or conversation, and be clear for a language learner.\nI will provide the verb. Take the provided verb exactly. Don't change its tense or person.",
      },
    },
  },
  instructions: {
    factory:
      'async ({ locals, strategy, context }) => {\n    const translationsGame = strategy.games.find((g) => g.type === "TRANSLATIONS");\n    const flashcardsGame = strategy.games.find((g) => g.type === "FLASHCARDS");\n    const { blacklist, language } = context;\n\n    //\n    // SCOPE\n    //\n    const FLASHCARD_COUNT = 5;\n\n    const structuralTag = strategy.tags.find((t) => t.type.includes("STRUCTURAL"));\n    const learnableTags = strategy.tags.filter((t) => t.type.includes("LEARNABLE"));\n    const vocabularyTags = strategy.tags.filter(\n        (t) =>\n            t.type.includes("ONTOLOGICAL") &&\n            ["pos"].includes(t.data["ONTOLOGICAL"].branch) &&\n            ["noun", "adj"].includes(t.data["ONTOLOGICAL"].leaf)\n    );\n\n    const articleUnit = await locals\n        .client("units/weakest/fromUnitIds", {\n            unitIds: strategy.units.map((u) => u.id),\n            take: 1\n        })\n        .single();\n\n    const numberTag = await locals\n        .client("tags/weakest", {\n            tagIds: learnableTags\n                .filter((t) => t.data["ONTOLOGICAL"].branch === "number")\n                .map((t) => t.id),\n            take: 1\n        })\n        .single();\n\n    const genderTag = await locals\n        .client("tags/weakest", {\n            tagIds: learnableTags\n                .filter((t) => t.data["ONTOLOGICAL"].branch === "gender")\n                .map((t) => t.id),\n            take: 1\n        })\n        .single();\n\n    //\n    // TRANSLATIONS\n    //\n    const constraints = [];\n    constraints.push(\n        `ARTICLE: ${articleUnit.data[language.learning]} - ${articleUnit.data[language.spoken]}`\n    );\n    [genderTag, numberTag].forEach((tag) =>\n        constraints.push(`${tag.data["ONTOLOGICAL"].branch}: ${tag.data["ONTOLOGICAL"].leaf}`)\n    );\n    constraints.push(`LENGTH: between 4-7 words.`);\n\n    for (const tag of vocabularyTags) {\n        const units = await locals\n            .client("units/pending", {\n                gameId: translationsGame.id,\n                tagIds: [structuralTag.id, tag.id],\n                blacklist: blacklist.units,\n                take: 4\n            })\n            .ok();\n        units.forEach((unit) => {\n            constraints.push(\n                `${tag.data["ONTOLOGICAL"].leaf}: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`\n            );\n        });\n    }\n\n    const translations = await locals\n        .ontology(`games/translations/generate`, {\n            constraints,\n            language,\n            gameId: translationsGame.id\n        })\n        .ok();\n\n    locals.scopeToBlacklist({ blacklist, scope: translations.scope });\n\n    //\n    // FLASHCARDS\n    //\n    const filteredTranslationUnits = await locals\n        .client("memory/filter/units", {\n            units: translations.scope.units,\n            accept: ["UNKNOWN", "LEARNING"]\n        })\n        .ok();\n\n    const flashcardUnits = [];\n    for (const tag of vocabularyTags) {\n        const units = await locals\n            .client("units/pending", {\n                gameId: flashcardsGame.id,\n                tagIds: [structuralTag.id, tag.id],\n                blacklist: blacklist.units,\n                take: Math.round((FLASHCARD_COUNT - filteredTranslationUnits.length) / 2)\n            })\n            .ok();\n        flashcardUnits.push(...units);\n    }\n\n    const flashcards = await locals\n        .ontology("games/flashcards/generate/fromUnitIds", {\n            unitIds: [...filteredTranslationUnits, ...flashcardUnits].map((u) => u.id),\n            gameId: flashcardsGame.id\n        })\n        .ok();\n\n    return [...locals.shuffle(flashcards), translations];\n};\n',
  },
};

async function install(runtime) {
  await runtime.call("/install/tactic", { tactic });
  return runtime;
}

export default { install };
