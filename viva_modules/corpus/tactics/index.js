const morphology = {
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

const conjugation = {
  name: "Verb conjugation",
  slug: "verb-conjugation",
  description:
    "Conjugate a set of verbs for a given tense and mood. Supported by flashcards and a translation.",
  relations: {
    units: {},
    tags: {
      mood: { slug: "mood:ind" },
      tense: { slug: "tense:pres" },
      verbs: [
        { slug: "lemma:creer" },
        { slug: "lemma:dar" },
        { slug: "lemma:deber" },
        { slug: "lemma:decir" },
        { slug: "lemma:estar" },
        { slug: "lemma:hablar" },
        { slug: "lemma:hacer" },
        { slug: "lemma:ir" },
        { slug: "lemma:llegar" },
        { slug: "lemma:llevar" },
        { slug: "lemma:parecer" },
        { slug: "lemma:pasar" },
        { slug: "lemma:poder" },
        { slug: "lemma:poner" },
        { slug: "lemma:quedar" },
        { slug: "lemma:querer" },
        { slug: "lemma:saber" },
        { slug: "lemma:ser" },
        { slug: "lemma:tener" },
        { slug: "lemma:ver" },
      ],
    },
    games: {
      translations: { slug: "translations" },
      flashcards: { slug: "flashcards" },
      conjugations: { slug: "conjugations" },
    },
  },
  masks: {},
  instructions: {
    factory:
      'async ({ locals, strategy, context }) => {\n    // console.log((await locals.supabase.from("Tag").select("*").eq("data->ONTOLOGICAL->>branch", "lemma")).data .map((t) => `"${t.id}", // ${t.data.ONTOLOGICAL.leaf}`) .join("\\n"));\n\n    const { blacklist, language } = context;\n\n    const conjugationsGame = strategy.games.find((g) => g.type === "CONJUGATIONS");\n    const flashcardsGame = strategy.games.find((g) => g.type === "FLASHCARDS");\n    const translationsGame = strategy.games.find((g) => g.type === "TRANSLATIONS");\n\n    //\n    // SCOPE\n    //\n    const verbTagIds = [\n        // temporary hardcode\n        "b200050b-0f2a-4759-85ae-dbd965f34596", // ser\n        "de18da86-6038-44ae-8ce7-282f24e99f21", // estar\n        "e25e00ff-0ef9-4b33-acce-1a6be3892058", // tener\n        "8c501ed6-243e-4197-937a-3e5854cc0e3e", // hacer\n        "60d52f32-5cd7-49df-8a54-b695c85601c9", // poder\n        "f393f08e-cb4a-465d-a016-3833ad42f20c", // decir\n        "b6b9818a-3aa9-41aa-822a-9f9fca3250d9", // ir\n        "048ce68d-fdf3-474f-bf87-f11cb16ab829", // ver\n        "dae289ad-54d4-4c73-be54-e2cfebcdc608", // dar\n        "915ffaee-5763-4986-bd6d-fda6bc539c3d", // saber\n        "df915a8a-148a-4231-af0c-f31cc626f29e", // querer\n        "eb55ddc2-959d-4b6a-bbfd-2b81a88711c4", // llegar\n        "c3869e1f-7245-48d2-b1ee-7cb72db7ed35", // pasar\n        "5d0fe4ab-eac2-435f-90a1-cf3407b27263", // deber\n        "6c0c53ec-06ce-4a92-9b17-a0edc9f39950", // poner\n        "1086f95c-ddec-46d6-a3f9-55caf8161bf3", // parecer\n        "e5330b3c-d95e-479f-a5dd-840ece7c5be7", // quedar\n        "7a46e84f-9024-4455-a338-fd9a8ce4df16", // creer\n        "9ebb46de-9ed0-4981-801a-cd8c93144fa1", // hablar\n        "5471ae1e-5522-4f20-842f-dc28917978ea" // llevar\n    ];\n    const tenseTags = [\n        "clrzb19mp0079g0m3badzek07" // Present Tense\n        // "clpwfwpt6000ug0n1htcn6x30", // Past Tense\n        // "clrzb96vh06gwg0mwasu65dg4", // Imperfect Tense\n        // "clpwfwpwg000wg0n16nvxfpmq" // Future Tense\n    ];\n    const moodTags = [\n        "clpwfwpfp000lg0n1q9872y8x" // Indicative\n    ];\n\n    const verbTag = await locals\n        .client("tags/weakest", {\n            tagIds: verbTagIds,\n            blacklist: blacklist.tags,\n            take: 1\n        })\n        .single();\n\n    //\n    // CONJUGATIONS\n    //\n    const conjugations = await locals\n        .ontology("games/conjugations/generate", {\n            tags: {\n                verb: { id: verbTag.id },\n                tense: { id: tenseTags[0] },\n                mood: { id: moodTags[0] }\n            },\n            gameId: conjugationsGame.id\n        })\n        .ok();\n\n    //\n    // TRANSLATIONS\n    //\n    const unit = await locals\n        .client("units/weakest/fromTagIds", {\n            tagIds: [verbTag.id, tenseTags[0], moodTags[0]],\n            blacklist,\n            take: 1\n        })\n        .single();\n\n    const constraints = [];\n    constraints.push(`VERB: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`);\n    constraints.push(`NOUN: Be creative in your choice of noun.`);\n    constraints.push(`NOUN: Don\'t use obvious nouns like \'estudiante\'.`);\n    constraints.push(\n        `NOUN: In case of ser/estar, chose a noun that highlights the lasting/temporary aspect of the verb.`\n    );\n    constraints.push(`GRAMMAR: Allways without the pronoun in spanish!`);\n\n    const translations = await locals\n        .ontology(`games/translations/generate`, {\n            language,\n            constraints,\n            gameId: translationsGame.id\n        })\n        .ok();\n\n    locals.scopeToBlacklist({ blacklist, scope: translations.scope });\n    // console.log("[conjugations]");\n    // console.log(JSON.stringify(conjugations, null, 2));\n\n    //\n    // FLASHCARDS\n    // from translation\n    const filteredTranslationUnits = await locals\n        .client("memory/filter/units", {\n            units: translations.scope.units,\n            accept: ["UNKNOWN", "LEARNING"]\n        })\n        .ok();\n    const translationFlashcards = await locals\n        .ontology("games/flashcards/generate/fromUnitIds", {\n            unitIds: filteredTranslationUnits.map((u) => u.id),\n            gameId: flashcardsGame.id\n        })\n        .ok();\n\n    //\n    // FLASHCARDS\n    // from conjugation\n    const flashcardUnits = await locals\n        .client("units/fromTagIds", {\n            tagIds: [verbTag.id, tenseTags[0], moodTags[0]],\n            blacklist: blacklist.units\n        })\n        .ok();\n    const filteredFlashcardUnits = await locals\n        .client("memory/filter/units", {\n            units: flashcardUnits,\n            accept: ["UNKNOWN", "LEARNING"]\n        })\n        .ok();\n\n    const flashcards = await locals\n        .ontology("games/flashcards/generate/fromUnits", {\n            units: filteredFlashcardUnits,\n            gameId: flashcardsGame.id\n        })\n        .ok();\n\n    return [\n        ...locals.shuffle([...flashcards, ...translationFlashcards]),\n        conjugations,\n        translations\n    ];\n};\n',
  },
};

async function install(runtime) {
  for (const tactic of [morphology, conjugation]) {
    console.log("installing", tactic);
    const installed = await runtime.call("/install/tactic", { tactic });
    console.log("installed", installed);
  }

  return runtime;
}

export default { install };
