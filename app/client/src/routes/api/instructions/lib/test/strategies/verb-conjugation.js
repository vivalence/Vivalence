export default async ({ locals, strategy, context }) => {
    // console.log((await locals.supabase.from("Tag").select("*").eq("data->ONTOLOGICAL->>branch", "lemma")).data .map((t) => `"${t.id}", // ${t.data.ONTOLOGICAL.leaf}`) .join("\n"));

    const instructions = [];

    const { blacklist, language } = context;

    const conjugationsGame = strategy.games.find((g) => g.type === "CONJUGATIONS");
    const flashcardsGame = strategy.games.find((g) => g.type === "FLASHCARDS");
    const translationsGame = strategy.games.find((g) => g.type === "TRANSLATIONS");

    //
    // SCOPE
    //
    const verbTagIds = [
        // temporary hardcode
        "b200050b-0f2a-4759-85ae-dbd965f34596", // ser
        "de18da86-6038-44ae-8ce7-282f24e99f21", // estar
        "e25e00ff-0ef9-4b33-acce-1a6be3892058", // tener
        "8c501ed6-243e-4197-937a-3e5854cc0e3e", // hacer
        "60d52f32-5cd7-49df-8a54-b695c85601c9", // poder
        "f393f08e-cb4a-465d-a016-3833ad42f20c", // decir
        "b6b9818a-3aa9-41aa-822a-9f9fca3250d9", // ir
        "048ce68d-fdf3-474f-bf87-f11cb16ab829", // ver
        "dae289ad-54d4-4c73-be54-e2cfebcdc608", // dar
        "915ffaee-5763-4986-bd6d-fda6bc539c3d", // saber
        "df915a8a-148a-4231-af0c-f31cc626f29e", // querer
        "eb55ddc2-959d-4b6a-bbfd-2b81a88711c4", // llegar
        "c3869e1f-7245-48d2-b1ee-7cb72db7ed35", // pasar
        "5d0fe4ab-eac2-435f-90a1-cf3407b27263", // deber
        "6c0c53ec-06ce-4a92-9b17-a0edc9f39950", // poner
        "1086f95c-ddec-46d6-a3f9-55caf8161bf3", // parecer
        "e5330b3c-d95e-479f-a5dd-840ece7c5be7", // quedar
        "7a46e84f-9024-4455-a338-fd9a8ce4df16", // creer
        "9ebb46de-9ed0-4981-801a-cd8c93144fa1", // hablar
        "5471ae1e-5522-4f20-842f-dc28917978ea" // llevar
    ];
    const tenseTags = [
        "clrzb19mp0079g0m3badzek07" // Present Tense
        // "clpwfwpt6000ug0n1htcn6x30", // Past Tense
        // "clrzb96vh06gwg0mwasu65dg4", // Imperfect Tense
        // "clpwfwpwg000wg0n16nvxfpmq" // Future Tense
    ];
    const moodTags = [
        "clpwfwpfp000lg0n1q9872y8x" // Indicative
    ];

    const { data: verbTags, error: verbError } = await locals.post("/api/tags/weakest", {
        tagIds: verbTagIds,
        blacklist: blacklist.tags,
        take: 1
    });
    if (verbError || !verbTags) throw verbError || new Error("No verb tag found.");
    const verbTag = verbTags[0];

    //
    // CONJUGATIONS
    //
    const { data: conjugations, error: conjugationsError } = await locals.post(
        "/api/games/conjugations/generate/fromTagIds",
        {
            tags: {
                verb: { id: verbTag.id },
                tense: { id: tenseTags[0] },
                mood: { id: moodTags[0] }
            },
            gameId: conjugationsGame.id
        }
    );
    if (conjugationsError) throw conjugationsError;

    //
    // TRANSLATIONS
    //
    const { data, error: unitsError } = await locals.post("/api/units/weakest/fromTagIds", {
        tagIds: [verbTag.id, tenseTags[0], moodTags[0]],
        blacklist,
        take: 1
    });
    if (unitsError) throw unitsError;
    const unit = data[0];

    const constraints = [];
    constraints.push(`VERB: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`);
    constraints.push(`NOUN: Be creative in your choice of noun.`);
    constraints.push(`NOUN: Don't use obvious nouns like 'estudiante'.`);
    constraints.push(
        `NOUN: In case of ser/estar, chose a noun that highlights the lasting/temporary aspect of the verb.`
    );
    constraints.push(`GRAMMAR: Allways without the pronoun in spanish!`);

    const { data: translations, error: sentenceError } = await locals.post(
        `/api/games/translations/generate`,
        {
            language,
            constraints,
            gameId: translationsGame.id
        }
    );
    if (sentenceError) throw sentenceError;
    locals.scopeToBlacklist({ blacklist, scope: translations.scope });
    // console.log("[conjugations]");
    // console.log(JSON.stringify(conjugations, null, 2));

    //
    // FLASHCARDS
    // from translation
    const { data: filteredTranslationUnits } = await locals.post("/api/memory/filter/units", {
        units: translations.scope.units,
        accept: ["UNKNOWN", "LEARNING"]
    });
    const { data: translationFlashcards } = await locals.post(
        "/api/games/flashcards/generate/fromUnitIds",
        {
            unitIds: filteredTranslationUnits.map((u) => u.id),
            gameId: flashcardsGame.id
        }
    );

    //
    // FLASHCARDS
    // from conjugation
    const { data: flashcardUnits } = await locals.post("/api/units/fromTagIds", {
        tagIds: [verbTag.id, tenseTags[0], moodTags[0]],
        blacklist: blacklist.units
    });
    const { data: filteredFlashcardUnits } = await locals.post("/api/memory/filter/units", {
        units: flashcardUnits,
        accept: ["UNKNOWN", "LEARNING"]
    });
    let { data: flashcards, error: flashcardsError } = await locals.post(
        "/api/games/flashcards/generate/fromUnits",
        {
            units: filteredFlashcardUnits,
            gameId: flashcardsGame.id
        }
    );
    if (flashcardsError) throw flashcardsError;

    return [
        ...locals.shuffle([...flashcards, ...translationFlashcards]),
        conjugations,
        translations
    ];
};
