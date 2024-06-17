import { json } from "@sveltejs/kit";

export async function POST({ fetch, locals: { supabase, post }, request }) {
    try {
        const { gameId, gameType, unitId, response } = await request.json();

        const { data: memoryData, error: memoryError } = await post("/api/memory", {
            gameId,
            gameType,
            unitId,
            response
        });
        if (memoryError) throw memoryError;

        const { data: playData, error: playError } = await post("/api/play", {
            gameId,
            memoryId: memoryData.memory.id,
            nextPlay: memoryData.nextPlay,
            unitId,
            response
        });
        if (playError) throw playError;

        const { data: unit } = await supabase.from("Unit").select("data").eq("id", unitId).single();

        // console.log("UNIT ", unit.data.spanish, memoryData.memory.status, memoryData.nextPlay, `${Math.round((memoryData.nextReviewIn / 7) * 100) / 100} days`, memoryData.memoryStatusChange ? "status change" : "no change", response, gameId);

        return json({
            data: { ...playData, ...memoryData },
            status: 200
        });
    } catch (err) {
        console.error(`ERROR /api/units POST:`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
