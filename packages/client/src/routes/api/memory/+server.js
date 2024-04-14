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

        memory = memories[0];

        if (!memory) {
            const model = ebisu.initiateModel(response);
            const nextReviewTime = ebisu.predictNextReviewTime(model);
            const nextPlay = getDateTimeInXHours(nextReviewTime);
            const now = new Date().toISOString();

            const history = [{ gameType, response, model, nextPlay, date: now }];
            const status = getStatus(nextReviewTime, history);

            const { data: createdMemory, error } = await supabase
                .from("Memory")
                .insert([
                    {
                        type: "EBISU_v2",
                        status,
                        state: model,
                        lastSeen: now,
                        history,
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
            const status = getStatus(nextReviewIn, history);

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

const getStatus = (nextReviewIn, history) => {
    // Helper function to check the last N responses in history
    const checkLastResponses = (n, condition) => {
        const recentResponses = history.slice(-n).map((entry) => entry.response);
        return recentResponses.every((response) => condition.includes(response));
    };

    // Calculate conditions for the responses
    const isUnknown = nextReviewIn < 1 || checkLastResponses(3, ["UNKNOWN"]);
    const isLearning = nextReviewIn >= 1 && nextReviewIn <= 24 * 7;
    const isKnown = nextReviewIn > 24 * 7 && checkLastResponses(3, ["KNOWN", "GRADUATED"]);
    const isGraduated = nextReviewIn > 24 * 14 && checkLastResponses(5, ["KNOWN", "GRADUATED"]);

    // Determine status based on conditions
    if (isUnknown) {
        return "UNKNOWN";
    } else if (isLearning) {
        return "LEARNING";
    } else if (isGraduated) {
        return "GRADUATED";
    } else if (isKnown) {
        return "KNOWN";
    }

    return "UNKNOWN";
};

// // Example usage
// const history = [
//   { response: "KNOWN", date: new Date() },
//   { response: "GRADUATED", date: new Date() },
//   { response: "KNOWN", date: new Date() }
// ];

// console.log(getStatus(15 * 24, history)); // Test with nextReviewIn in hours
