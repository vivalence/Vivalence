import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import { make } from "../make";

export async function POST({ fetch, locals, request }) {
    try {
        const { gameId, unitIds } = await request.json();

        const { data: game, error: gameError } = await locals.supabase
            .from("Game")
            .select(`*`)
            .eq("id", gameId)
            .single();

        const { data: units, error: unitsError } = await locals.supabase
            .from("Unit")
            .select(`*`)
            .filter("id", "in", unitIds);

        // const { data: units } = await locals.get("/api/units", {gameId, tagIds, whitelist: whitelist.units || [], blacklist: blacklist.units || [], take});

        const instructions = [];
        for (const unit of units) {
            const instruction = make({ game, unit });
            instructions.push({
                type: "FLASHCARDS",
                instruction,
                evaluate: { unit: { id: unit.id }, game: { id: gameId } },
                blacklist: { units: [unit.id], tags: [] }
                // payload: { gameId, strategyId }
            });
        }

        return json({ data: instructions, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/flashcards/generate/fromIds", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
