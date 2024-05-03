export default async ({ locals, strategy, context }) => {
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
        "95c57480-2b9d-4617-8293-6b428f26a68e", // estar
        "bce30a11-51a0-4c46-8db0-ae8c12970c81", // ser
        "05a4c4ab-2c70-4e72-b5ca-cdb19a9b36d2", // haber
        "a813d3ba-ca1a-48ac-982b-8002403496df", // tener
        "660cd59b-cee3-4d57-8845-ce21f0d7518e", // hacer
        "33ba7fa1-2743-451f-afdc-c905e6f52847", // ir
        "d12a26e6-9b32-4da6-a5a8-7c126c6e0286", // saber
        "7b7da598-2253-474a-8342-a3363bed81c6", // decir
        "4786c606-85a4-416b-9d16-fbd26c0025e7", // poder
        "97ec1972-bdf0-49e1-86dc-1fd4bbc3fbd1", // dar
        "e46c9773-8fd0-4cfb-932a-be8e3ab80615" // ver
    ];
    const tenseTags = [
        "clrzb19mp0079g0m3badzek07" // present tense
    ];

    const { data: verbTags, error: verbError } = await locals.post("/api/tags/weakest", {
        tagIds: verbTagIds,
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
            tags: { verb: { id: verbTag.id }, tense: { id: tenseTags[0] } },
            gameId: conjugationsGame.id
        }
    );
    if (conjugationsError) throw conjugationsError;

    //
    // FLASHCARDS
    //
    const { data: flashcards, error: flashcardsError } = await locals.post(
        "/api/games/flashcards/generate/fromTagIds",
        {
            tagIds: [verbTag.id, tenseTags[0]],
            gameId: flashcardsGame.id,
            blacklist
        }
    );
    if (flashcardsError) throw flashcardsError;

    //
    // TRANSLATIONS
    //
    const { data, error: unitsError } = await locals.post("/api/units/weakest/fromTagIds", {
        tagIds: [verbTag.id, tenseTags[0]],
        blacklist,
        take: 1
    });
    if (unitsError) throw unitsError;
    const unit = data[0];

    const constraints = [];
    constraints.push(`VERB: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`);
    constraints.push(`NOUN: Don't use obvious nouns like 'estudiante'.`);
    constraints.push(`NOUN: Be more creative in your choice of noun.`);
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

    return [...locals.shuffle(flashcards), conjugations, translations];
};

//     //
//     // TRANSLATIONS
//     //
//     // let translationInstruction = null;
//     async function.postTranslation(unit) {
//         const lang = context.language;
//         const constraints = [];
//         constraints.push(`VERB: ${unit.data[lang.learning]} - ${unit.data[lang.spoken]}`);
//         constraints.push(`NOUN: Be more creative.`);
//         constraints.push(`NOUN: Don't use obvious nouns like 'estudiante'.`);
//         constraints.push(
//             `NOUN: In case of ser/estar, chose a noun that highlights the lasting/temporary aspect of the verb.`
//         );
//         constraints.push(`GRAMMAR: Allways without the pronoun in spanish!`);

//         const { data: sentence, error: sentenceError } = await locals.post(
//             `/api/games/translations/generate`,
//             {
//                 constraints,
//                 language: lang,
//                 innerPrompt: translationsGame.data.innerPrompt.text
//             }
//         );
//         if (sentenceError) throw sentenceError;

//         const { data: nlp } = await locals.post(`/api/nlp`, { sentence: sentence.learning });

//         const translationTokens = nlp.sentences[0].tokens
//             .filter((token) => token.unit)
//             .filter((token) => {
//                 if (!token.unit.Memory) return true;
//                 return ["LEARNING", "UNKNOWN"].includes(token.unit.Memory.status);
//             })
//             .filter((token) => token.unit.id !== unit.id);

//         translationTokens.forEach((token) => blacklist.units.push(token.unit.id));

//         const maskFlashcards = (flashcardsMask, { data, ...unit }) => {
//             const mask = flashcardsMask[unit.corpusType];
//             const isNoun = data.ud.upos === "NOUN";
//             const { Gender, Number } = data.ud.feats;
//             const frontFooter = [Gender, Number].filter((f) => f).join(" - ");
//             const maskData = {
//                 front: {
//                     header: `<h2>${data.english}<h2>`,
//                     content: `<p>${data.usageInEnglish}<p>`,
//                     footer: `<h5>${frontFooter}</h5>`
//                 },
//                 back: {
//                     header: `<h2>${data.spanish}<h2>`,
//                     content: `<p>${data.usageInSpanish}<p>`
//                 }
//             };

//             return {
//                 front: locals.Mustache.render(mask["front"], maskData),
//                 back: locals.Mustache.render(mask["back"], maskData)
//             };
//         };
//         for (const token of translationTokens) {
//             instructions.unshift({
//                 type: "FLASHCARDS",
//                 instruction: maskFlashcards(flashcardsGame.data, {
//                     ...token.unit,
//                     data: {
//                         ...token.unit.data,
//                         spanish: token.token,
//                         ud: token
//                     }
//                 }),
//                 blacklist: { units: [token.unit.id], tags: [] },
//                 payload: {
//                     corpusType: token.unit.corpusType,
//                     source: "TOKEN",
//                     token: token,
//                     gameId: flashcardsGame.id,
//                     unitId: token.unit.id,
//                     strategyId: context.strategyId
//                 }
//             });
//         }

//         translationInstruction = {
//             type: "TRANSLATIONS",
//             instruction: sentence,
//             blacklist: { units: translationTokens.map(({ unit }) => unit.id), tags: [] },
//             payload: {
//                 gameId: translationsGame.id,
//                 unitIds: translationTokens.map(({ unit }) => unit.id),
//                 tokens: nlp.sentences[0].tokens,
//                 strategyId: context.strategyId
//             }
//         };
//         // return instructions
//     }

//     const weakestUnit = units.reduce((a, b) =>
//         !a.memory ? a : !b.memory ? b : a.memory.strength > b.memory.strength ? a : b
//     );
//     await.postTranslation(weakestUnit);

//     //
//     // CONJUGATIONS
//     //
//     async function.postConjugations() {
//         const conjugations = units.map((unit) => {
//             const conjugation = {
//                 spoken: `${unit.data.english}`,
//                 learning: `${unit.data.spanish}`,
//                 payload: { unit },
//                 index: unit.index
//             };
//             unit.tags.map((tag) => {
//                 conjugation[tag.data.ONTOLOGICAL.branch] = tag.data.ONTOLOGICAL.leaf;
//             });
//             return conjugation;
//         });

//         const maskFlashcards = (flashcardsMask, { data, ...unit }) => {
//             const mask = flashcardsMask[unit.corpusType];
//             // console.log('make flashcard', {...unit,data})
//             const { Person, Number, Tense } = data.ud.feats;
//             const frontFooter = `${Tense} - ${Person} Person ${Number}`;

//             const maskData = {
//                 front: {
//                     header: `<h2>${data.english}<h2>`,
//                     content: data.usageInEnglish ? `<p>${data.usageInEnglish}<p>` : "",
//                     footer: `<h5>${frontFooter}</h5>`
//                 },
//                 back: {
//                     header: `<h2>${data.spanish}<h2>`,
//                     content: data.usageInSpanish ? `<p>${data.usageInSpanish}<p>` : ""
//                 }
//             };

//             return {
//                 front: locals.Mustache.render(mask["front"], maskData),
//                 back: locals.Mustache.render(mask["back"], maskData)
//             };
//         };

//         // TODO: filter by memory
//         for (const conjugation of conjugations) {
//             const unit = conjugation.payload.unit;
//             if (unit.memory && ["KNOWN", "GRADUATED"].includes(unit.memory.status)) continue;

//             instructions.unshift({
//                 type: "FLASHCARDS",
//                 instruction: maskFlashcards(flashcardsGame.data, unit),
//                 blacklist: { units: [unit.id], tags: [tenseTags[0]] },
//                 payload: {
//                     source: "CONJUGATION",
//                     corpusType: unit.corpusType,
//                     gameId: flashcardsGame.id,
//                     strategyId: context.strategyId,
//                     unitId: unit.id
//                 }
//             });
//         }
//         return conjugations;
//     }
//     const conjugations = await.postConjugations(units);

//     locals.shuffle(instructions);
//     // instructions.push({type: "CONJUGATIONS", instruction: {tense: "Pres", // this should come from the tense tag verb: {spoken: infinitiveVerb.data.english, learning: infinitiveVerb.data.spanish}, conjugations}, blacklist: {units: conjugations.map((c) => c.payload.unit.id), tags: [verbTag.id, tenseTags[0]]}, payload: {source: "CONJUGATION", tags: { verb: verbTag.id, tense: tenseTags[0] }, gameId: conjugationsGame.id, strategyId: context.strategyId}});
//     instructions.push(translationInstruction);

//     return instructions;
// };
