import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import { make } from "../make";

export async function POST({ fetch, locals, request }) {
    try {
        const { gameId, strategyId, tagIds, blacklist, take } = await request.json();

        const { data: game, error: gameError } = await locals.supabase
            .from("Game")
            .select(`*`)
            .eq("id", gameId)
            .single();

        // const { data: units } = await locals.get("/api/units", {gameId, tagIds, whitelist: whitelist.units || [], blacklist: blacklist.units || [], take});

        // const tags = await locals.supabase.from("Tag").select("*").in("id", tagIds);

        const { data: units, error: unitsError } = await locals.get("/api/units", {
            gameId,
            tagIds,
            blacklist: blacklist.units,
            take: take || 5
        });

        const instructions = [];
        for (const unit of units) {
            const instruction = make({ game, unit });
            instructions.push({
                type: "FLASHCARDS",
                instruction,
                evaluate: {
                    unit: { id: unit.id, tags: tagIds.map((tagId) => ({ id: tagId })) },
                    game: { id: gameId }
                },
                blacklist: { units: [unit.id], tags: tagIds }
            });
        }

        return json({ data: instructions, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/flashcards/generate/fromUnits", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
