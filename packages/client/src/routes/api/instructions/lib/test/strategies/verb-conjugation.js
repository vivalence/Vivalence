export default async ({ locals, strategy, context }) => {
    const instructions = [];

    const blacklist = context.blacklist;

    const conjugationsGame = strategy.Games.find((g) => g.type === "CONJUGATIONS");
    const flashcardsGame = strategy.Games.find((g) => g.type === "FLASHCARDS");
    const translationsGame = strategy.Games.find((g) => g.type === "TRANSLATIONS");

    const verbTags = [
        // temporary
        "95c57480-2b9d-4617-8293-6b428f26a68e", // estar
        "bce30a11-51a0-4c46-8db0-ae8c12970c81" // ser
    ];
    const tenseTags = [
        "clrzb19mp0079g0m3badzek07" // present
    ];

    let response = await locals.get("/api/tags", {
        // tagIds: [structuralTag.id, tag.id],
        gameId: conjugationsGame.id,
        whitelist: verbTags,
        blacklist: blacklist.tags,
        take: 1
    });
    if (response.error) throw response.error;

    const verbTag = response.data[0];
    if (!verbTag) throw new Error("No verb tag found");

    response = await locals.supabase
        .from("Tag")
        .select(
            `*, _TagToUnit(*, Unit: B (*, Memory (id, tagId, unitId, state, status, lastSeen),  _TagToUnit(*, Tag: A (*))))`
        )
        .eq("id", verbTag.id)
        .filter("_TagToUnit.Unit.Memory.tagId", "is", null)
        .single();

    if (response.error) throw response.error;
    let units = response.data._TagToUnit.map(({ Unit }) => Unit);

    const infinitiveVerb = units.find(({ _TagToUnit }) => {
        const tags = _TagToUnit
            .map(({ Tag }) => Tag)
            .filter(({ type }) => type.includes("ONTOLOGICAL"));
        return tags.find(
            ({ data }) => data.ONTOLOGICAL.branch === "VerbForm" && data.ONTOLOGICAL.leaf === "Inf"
        );
    });

    units = units
        .map((unit) => {
            if (unit._TagToUnit.map(({ A }) => A).includes(tenseTags[0])) {
                unit.tags = unit._TagToUnit
                    .map(({ Tag }) => Tag)
                    .filter(
                        (tag) =>
                            tag.type.includes("ONTOLOGICAL") &&
                            ["Person", "Number"].includes(tag.data["ONTOLOGICAL"].branch)
                    );
                delete unit._TagToUnit;
                return unit;
            }
        })
        .filter((unit) => unit)
        .map((unit, index) => {
            unit.index = index;
            unit.memory = unit.Memory.find((m) => !m.tagId);
            delete unit.Memory;
            if (unit.memory)
                unit.memory.strength = locals.ebisu.predictRecallNow(
                    unit.memory.state,
                    unit.memory.lastSeen
                );
            return unit;
        });

    // TODO
    // const sortUnits = (units) => {
    //     const getSortValue = (tag) => {const { leaf, branch } = tag.data.ONTOLOGICAL; if (branch === "Person") return parseInt(leaf); return leaf === "Sing" ? 0 : 1;};
    //     return units.sort((a, b) => {
    //         const aSortValues = a.tags.map(getSortValue), bSortValues = b.tags.map(getSortValue);
    //         for (let i = 0; i < Math.min(aSortValues.length, bSortValues.length); i++) {
    //             if (aSortValues[i] !== bSortValues[i]) return aSortValues[i] - bSortValues[i];
    //         }
    //         return aSortValues.length - bSortValues.length;
    //     });
    // };

    //
    // TRANSLATIONS
    //
    async function getTranslation(unit) {
        const lang = context.language;
        const constraints = [];
        constraints.push(`VERB: ${unit.data[lang.learning]} - ${unit.data[lang.spoken]}`);

        const { data: sentence, error: sentenceError } = await locals.get(
            `/api/games/translations/generate`,
            {
                constraints,
                language: lang,
                innerPrompt: translationsGame.data.innerPrompt.text
            }
        );
        if (sentenceError) throw sentenceError;

        const { data: nlp } = await locals.get(`/api/nlp`, { sentence: sentence.learning });

        const translationTokens = nlp.sentences[0].tokens

            .filter((token) => token.unit)
            .filter((token) => {
                if (!token.unit.Memory) return true;
                return ["LEARNING", "UNKNOWN"].includes(token.unit.Memory.status);
            })
            .filter((token) => token.unit.id !== unit.id);

        translationTokens.forEach((token) => blacklist.units.push(token.unit.id));

        const maskFlashcards = (flashcardsMask, { data, ...unit }) => {
            const mask = flashcardsMask[unit.corpusType];
            const isNoun = data.ud.upos === "NOUN";
            const { Gender, Number } = data.ud.feats;
            const frontFooter = [Gender, Number].filter((f) => f).join(" - ");
            const maskData = {
                front: {
                    header: `<h2>${data.english}<h2>`,
                    content: `<p>${data.usageInEnglish}<p>`,
                    footer: `<h5>${frontFooter}</h5>`
                },
                back: {
                    header: `<h2>${data.spanish}<h2>`,
                    content: `<p>${data.usageInSpanish}<p>`
                }
            };

            return {
                front: locals.Mustache.render(mask["front"], maskData),
                back: locals.Mustache.render(mask["back"], maskData)
            };
        };
        for (const token of translationTokens) {
            instructions.unshift({
                type: "FLASHCARDS",
                instruction: maskFlashcards(flashcardsGame.data, {
                    ...token.unit,
                    data: {
                        ...token.unit.data,
                        spanish: token.token,
                        ud: token
                    }
                }),
                blacklist: { units: [token.unit.id], tags: [] },
                payload: {
                    corpusType: token.unit.corpusType,
                    source: "TOKEN",
                    token: token,
                    gameId: flashcardsGame.id,
                    unitId: token.unit.id,
                    strategyId: context.strategyId
                }
            });
        }

        instructions.push({
            type: "TRANSLATIONS",
            instruction: sentence,
            blacklist: { units: translationTokens.map(({ unit }) => unit.id), tags: [] },
            payload: {
                gameId: translationsGame.id,
                unitIds: translationTokens.map(({ unit }) => unit.id),
                tokens: nlp.sentences[0].tokens,
                strategyId: context.strategyId
            }
        });
        // return instructions
    }
    const weakestUnit = units.reduce((a, b) => (a.memory.strength > b.memory.strength ? a : b));
    await getTranslation(weakestUnit);

    //
    // CONJUGATIONS
    //
    async function getConjugations(units) {
        const conjugations = units.map((unit) => {
            const conjugation = {
                spoken: `${unit.data.english}`,
                learning: `${unit.data.spanish}`,
                payload: { unit },
                index: unit.index
            };
            unit.tags.map((tag) => {
                conjugation[tag.data.ONTOLOGICAL.branch] = tag.data.ONTOLOGICAL.leaf;
            });
            return conjugation;
        });

        const maskFlashcards = (flashcardsMask, { data, ...unit }) => {
            const mask = flashcardsMask[unit.corpusType];
            // console.log('make flashcard', {...unit,data})
            const { Person, Number, Tense } = data.ud.feats;
            const frontFooter = `${Tense} - ${Person} Person ${Number}`;
            const maskData = {
                front: {
                    header: `<h2>${data.english}<h2>`,
                    content: `<p>${data.usageInEnglish}<p>`,
                    footer: `<h5>${frontFooter}</h5>`
                },
                back: {
                    header: `<h2>${data.spanish}<h2>`,
                    content: `<p>${data.usageInSpanish}<p>`
                }
            };

            return {
                front: locals.Mustache.render(mask["front"], maskData),
                back: locals.Mustache.render(mask["back"], maskData)
            };
        };

        // TODO: filter by memory
        for (const conjugation of conjugations) {
            // console.log('conjugation',conjugation)
            const unit = conjugation.payload.unit;
            instructions.unshift({
                type: "FLASHCARDS",
                instruction: maskFlashcards(flashcardsGame.data, unit),
                blacklist: { units: [unit.id], tags: [tenseTags[0]] },
                payload: {
                    source: "CONJUGATION",
                    corpusType: unit.corpusType,
                    gameId: flashcardsGame.id,
                    strategyId: context.strategyId,
                    unitId: unit.id
                }
            });
        }
        return conjugations;
    }
    const conjugations = await getConjugations(units);

    locals.shuffle(instructions);
    instructions.push({
        type: "CONJUGATIONS",
        instruction: {
            tense: "Pres", // this should come from the tense tag
            verb: {
                spoken: infinitiveVerb.data.english,
                learning: infinitiveVerb.data.spanish
            },
            conjugations
        },
        blacklist: {
            units: conjugations.map((c) => c.payload.unit.id),
            tags: [verbTag.id, tenseTags[0]]
        },
        payload: {
            source: "CONJUGATION",
            gameId: conjugationsGame.id,
            strategyId: context.strategyId
        }
    });

    console.log("instructions", instructions);
    console.log("instructions", instructions.length);
    return instructions;
};
