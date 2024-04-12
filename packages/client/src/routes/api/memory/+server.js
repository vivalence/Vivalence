import { json } from "@sveltejs/kit";
import { getDateTimeInXHours, getTimeDifferenceFromNow } from "$lib/time";
import * as ebisu from "$lib/ebisu";

// { gameId, gameType, unitId, response }
export async function POST({ locals: { supabase, getSession }, request, ...props }) {
    try {
        const { gameType, gameId, tagId, unitId, response } = await request.json();
        const { user } = await getSession();

        let memory, nextPlay;

        let query = supabase
            .from("Memory")
            .select("id, unitId, tagId, userId, state, status, lastSeen, history")
            .eq("unitId", unitId)
            .eq("userId", user.id);
        if (tagId) query = query.eq("tagId", tagId);
        else query = query.filter("tagId", "is", null);

        const { data: memories, error } = await query.limit(1);
        if (error) throw error;
        // console.log("memories", memories);
        memory = memories[0];

        if (!memory) {
            const model = ebisu.initiateModel(response);
            const nextReviewTime = ebisu.predictNextReviewTime(model);
            const nextPlay = getDateTimeInXHours(nextReviewTime);
            const now = new Date().toISOString();

            const { data: createdMemory, error } = await supabase
                .from("Memory")
                .insert([
                    {
                        type: "EBISU_v2",
                        status: "LEARNING",
                        state: model,
                        lastSeen: now,
                        history: [{ gameType, response, model, nextPlay, date: now }],
                        userId: user.id,
                        unitId,
                        tagId
                    }
                ])
                .single()
                .select("id, state, lastSeen");

            if (error) throw error;
            return json({
                data: {
                    memory: createdMemory,
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

            const { data: updatedMemory, error } = await supabase
                .from("Memory")
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
                    memory: updatedMemory,
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
