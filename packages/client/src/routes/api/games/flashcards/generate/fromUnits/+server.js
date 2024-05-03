import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import make from "../make";

export async function POST({ fetch, locals, request }) {
    try {
        const { gameId, strategyId, units } = await request.json();

        const { data: game, error: gameError } = await locals.supabase
            .from("Game")
            .select(`*`)
            .eq("id", gameId)
            .single();
        if (gameError) throw gameError;

        const instructions = [];
        for (const unit of units) {
            const instruction = make({ game, unit });

            const scope = { unit: { id: unit.id }, game: { id: gameId } };
            if (unit.tags && unit.tags.length > 0) {
                scope.unit.tags = unit.tags.map((tag) => ({ id: tag.id }));
            }

            instructions.push({
                type: "FLASHCARDS",
                instruction,
                scope
            });
        }

        return json({ data: instructions, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/flashcards/generate/fromUnits", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
