import Mustache from "mustache";
const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const QueueProvisioningLock = new Map();

export default async ({ blacklist, strategyId, userId, locals }) => {
    if (QueueProvisioningLock.has(`${userId}-${strategyId}`)) {
        return { status: 202 };
    } else {
        QueueProvisioningLock.set(`${userId}-${strategyId}`, new Date());
        makeInstructions({ userId, blacklist, strategyId, locals });
        return { status: 202 };
    }
};

const makeInstructions = async ({ strategyId, blacklist, userId, locals }) => {
    const start = performance.now();

    try {
        // GET DATA
        const { data: strategy, error } = await locals.supabase
            .from("Strategy")
            .select(`*, _StrategyToGame (Game: A (*)), _StrategyToTag (Tag: B (*))`)
            .eq("id", strategyId)
            .single();

        if (error) console.error(error);

        const { data: queue = [] } = await locals.supabase
            .from("Queue")
            .select("data")
            .eq("strategyId", strategyId)
            .eq("userId", userId);

        queue.map(({ data }) => data.payload.blacklist.forEach((id) => blacklist.push(id)));

        strategy.tags = strategy._StrategyToTag.map((t) => t.Tag);
        strategy.games = strategy._StrategyToGame.map((g) => g.Game);
        locals.maskFlashcards = maskFlashcards;

        const context = {
            blacklist,
            userId,
            strategyId,
            language: { learning: "spanish", spoken: "english" }
        };

        const strategyProvisioning = new Function(`return ${strategy.data.provisioning}`)();
        const instructions = await strategyProvisioning({ locals, strategy, context });

        // PERSIST INSTRUCTIONS
        const insert = await locals.supabase
            .from("Queue")
            .insert(instructions.map((data, index) => ({ userId, strategyId, data, index })));

        if (insert.error) throw insert.error;

        const end = performance.now();
        console.log(`PROVISIONING ${instructions.length}  took ${(end - start) / 1000} seconds`);
    } catch (error) {
        console.error(`[PROVISIONING ERROR]`, error.message);
        console.error(error);
    } finally {
        QueueProvisioningLock.delete(`${userId}-${strategyId}`);
    }
};

const maskFlashcards = (flashcardsMask, unit) => {
    const mask = flashcardsMask[unit.corpusType];
    const buildMaskData = new Function(`return ${mask.buildData}`)();
    const maskData = buildMaskData(unit);
    return {
        front: Mustache.render(mask["front"], maskData),
        back: Mustache.render(mask["back"], maskData)
    };
};

// const generateInstructionsFromStrategy = async ({ locals, strategy, context }) => {
//     const structuralTag = strategy.tags.find((g) => g.type.includes("STRUCTURAL"));
//     const ontologicalTags = strategy.tags.filter((g) => g.type.includes("ONTOLOGICAL"));

//     const translationsGame = strategy.games.find((g) => g.type === "TRANSLATIONS");
//     const flashcardsGame = strategy.games.find((g) => g.type === "FLASHCARDS");

//     // GET SENTENCE
//     const units = [];
//     for (const tag of ontologicalTags) {
//         const response = await locals.get("/api/units", {
//             tagIds: [structuralTag.id, tag.id],
//             gameId: translationsGame.id,
//             blacklist: context.blacklist,
//             take: 3
//         });
//         if (response.error) console.error(response.error);
//         else units.push(...response.data);
//     }
//     const { data: sentence } = await locals.get(`/api/games/translations/generate`, {
//         units,
//         language: strategy.data.language,
//         innerPrompt: translationsGame.data.innerPrompt.text
//     });
//     const { data: nlp } = await locals.get(`/api/nlp`, { sentence: sentence.learning });
//     const translationUnits = nlp.sentences[0].tokens
//         .map((token) => token.unit)
//         .filter((unit) => unit);

//     translationUnits.forEach((unit) => context.blacklist.push(unit.id));

//     // GET FLASHCARD
//     const { data: flashcardUnits } = await locals.get("/api/units", {
//         tagIds: [structuralTag.id],
//         gameId: flashcardsGame.id,
//         blacklist: context.blacklist,
//         take: 5
//     });

//     // MAKE INSTRUCTIONS
//     const instructions = [];

//     for (const unit of flashcardUnits) {
//         if (!unit) continue;
//         instructions.push({
//             type: "FLASHCARDS",
//             instructions: locals.maskFlashcards(flashcardsGame.data, unit),
//             payload: {
//                 blacklist: [unit.id],
//                 gameId: flashcardsGame.id,
//                 unitId: unit.id,
//                 strategyId: context.strategyId
//             }
//         });
//     }

//     for (const unit of translationUnits) {
//         if (!unit) continue;
//         if (unit.memoryModel && ["KNOWN", "GRADUATED"].includes(unit.memoryModel.status)) continue;
//         instructions.push({
//             type: "FLASHCARDS",
//             instructions: locals.maskFlashcards(flashcardsGame.data, unit),
//             payload: {
//                 blacklist: [unit.id],
//                 gameId: flashcardsGame.id,
//                 unitId: unit.id,
//                 strategyId: context.strategyId
//             }
//         });
//     }

//     instructions.push({
//         type: "TRANSLATIONS",
//         instructions: sentence,
//         payload: {
//             blacklist: translationUnits.map(({ id }) => id),
//             gameId: translationsGame.id,
//             unitIds: translationUnits.map(({ id }) => id),
//             tokens: nlp.sentences[0].tokens,
//             strategyId: context.strategyId
//         }
//     });

//     return instructions;
// };
