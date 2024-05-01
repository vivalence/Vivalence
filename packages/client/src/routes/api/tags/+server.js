import { json } from "@sveltejs/kit";

export async function POST({ fetch, locals: { supabase, post }, request }) {
    const params = await request.json();
    try {
        const { gameId, gameType, tagId, unitId, response } = params;

        const { data: memoryData, error: memoryError } = await post("/api/memory", {
            gameId,
            gameType,
            unitId,
            tagId,
            response
        });

        if (memoryError) throw memoryError;

        const { data: playData, error: playError } = await post("/api/play", {
            gameId,
            memoryId: memoryData.memory.id,
            nextPlay: memoryData.nextPlay,
            unitId,
            tagId,
            response
        });

        const { data: tag } = await supabase.from("Tag").select("data").eq("id", tagId).single();

        if (playError) throw playError;

        return json({
            data: { ...tag, ...playData, ...memoryData },
            status: 200
        });
    } catch (err) {
        console.error(`[ERROR] /api/tags POST:\n`, err.message);
        console.error(err);
        console.error(params);
        return json({ status: 500, error: err });
    }
}
