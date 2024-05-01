import { json } from "@sveltejs/kit";
import Mustache from "mustache";
import { env } from "$env/dynamic/private";

const { SYSTEM_MODE } = env;

export async function POST({ fetch, locals, request }) {
    try {
        const { gameId, strategyId, unitIds } = await request.json();

        const { data: game, error: errorGame } = await locals.supabase
            .from("Game")
            .select(`id, data`)
            .eq("id", gameId)
            .single();

        const { data: units, error: errorUnits } = await locals.supabase
            .from("Unit")
            .select(`*`)
            .eq("id", unitIds);

        // MAKE INSTRUCTIONS
        const instructions = [];

        for (const unit of units) {
            const conjugation = {
                spoken: `${unit.data.english}`,
                learning: `${unit.data.spanish}`,
                payload: { unit: unit.id },
                index: unit.index
            };
            return conjugation;
        }

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
                tags: { verb: verbTag.id, tense: tenseTags[0] },
                gameId: conjugationsGame.id,
                strategyId: context.strategyId
            }
        });

        // let make;
        // if (["VERB", "AUX"].includes(unit.data.ud.upos)) make = verbFlashcards;
        // else if (["NOUN"].includes(unit.data.ud.upos)) make = nounFlashcards;
        // const instruction = make(game.data, unit);
        // instructions.push({
        //     type: "FLASHCARDS",
        //     instruction,
        //     blacklist: { units: [unit.id], tags: tagIds || [] },
        //     payload: { gameId, unit: unit.id, tags: tagIds }
        // });
        // }

        return json({ data: instructions, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/conjugation/generate", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
