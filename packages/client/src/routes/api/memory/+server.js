import { json } from "@sveltejs/kit";
import { getDateTimeInXHours, getTimeDifferenceFromNow } from "$lib/time";
import * as ebisu from "$lib/ebisu";

// { gameId, gameType, unitId, response }
export async function POST({ locals: { supabase, getSession }, request, ...props }) {
    try {
        const { gameType, gameId, unitId, response } = await request.json();
        const { user } = await getSession();

        let nextPlay, memory;

        let { data: memories, error } = await supabase
            .from("MemoryModel")
            .select("id, unitId, userId, state, status, lastSeen, history")
            .eq("unitId", unitId)
            .eq("userId", user.id)
            .limit(1);

        if (error) throw error;

        memory = memories[0];

        if (!memory) {
            const model = ebisu.initiateModel(response);
            const nextReviewTime = ebisu.predictNextReviewTime(model);
            const nextPlay = getDateTimeInXHours(nextReviewTime);
            const now = new Date().toISOString();

            const { data: createdMemory, error } = await supabase
                .from("MemoryModel")
                .insert([
                    {
                        type: "EBISU_v2",
                        status: "LEARNING",
                        state: model,
                        lastSeen: now,
                        history: [{ gameType, response, model, nextPlay, date: now }],
                        unitId: unitId,
                        userId: user.id
                    }
                ])
                .single()
                .select("id, state, lastSeen");

            if (error) throw error;
            return json({
                data: {
                    memoryModel: createdMemory,
                    nextPlay
                },
                error: null
            });
        } else {
            const now = new Date().toISOString();
            const elapsedTime = getTimeDifferenceFromNow(memory.lastSeen);
            const model = ebisu.updateModel(memory.state, response, elapsedTime);
            const nextReviewIn = ebisu.predictNextReviewTime(model);
            const nextPlay = getDateTimeInXHours(nextReviewIn);

            const history = [...memory.history, { gameType, response, model, nextPlay, date: now }];

            const status = nextReviewIn > 24 * 7 ? "KNOWN" : "LEARNING";

            const { data: updatedMemoryModel, error } = await supabase
                .from("MemoryModel")
                .update({
                    state: model,
                    status,
                    history,
                    lastSeen: now,
                    updatedAt: now
                })
                .eq("id", memory.id)
                .single()
                .select("id, state, status, lastSeen");

            if (error) throw error;
            return json({
                data: {
                    memoryModel: updatedMemoryModel,
                    nextReviewIn,
                    nextPlay,
                    memoryStatusChange: status !== memory.status
                },
                status: 200
            });
        }
    } catch (err) {
        console.error(`[MEMORY ERROR /api/memory]`, err.message);
        console.error(err);
        return json({ error: err, status: 500 });
    }
}
