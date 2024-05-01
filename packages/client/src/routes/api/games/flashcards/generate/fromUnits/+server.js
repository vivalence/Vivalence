import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import { make } from "../make";

export async function POST({ fetch, locals, request }) {
    try {
        const { gameId, strategyId, units } = await request.json();

        const { data: game, error: gameError } = await locals.supabase
            .from("Game")
            .select(`*`)
            .eq("id", gameId)
            .single();

        // const { data: units } = await locals.get("/api/units", {gameId, tagIds, whitelist: whitelist.units || [], blacklist: blacklist.units || [], take});

        const instructions = [];
        for (const unit of units) {
            const instruction = make({ game, unit });

            const evaluate = { unit: { id: unit.id }, game: { id: gameId } };
            if (unit.tags && unit.tags.length > 0) {
                evaluate.unit.tags = unit.tags.map((tag) => ({ id: tag.id }));
            }

            instructions.push({
                type: "FLASHCARDS",
                instruction,
                evaluate,
                blacklist: { units: [unit.id], tags: [] }
            });
        }

        return json({ data: instructions, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/flashcards/generate/fromUnits", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
