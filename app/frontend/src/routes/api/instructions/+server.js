import { SYSTEM_MODE } from "$env/static/private";
import { json } from "@sveltejs/kit";
import provisionInstructions from "./lib/provision";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms * 1000));
const PROVISION_THRESHOLD = 8;

export async function POST({ locals, params, request }) {
    console.log("/api/instructions GET<POST>");
    try {
        const session = await locals.getSession();
        if (!session) throw redirect(307, "/auth");

        const { strategyId, take, blacklist } = await request.json();
        const userId = session.user.id;

        const pendingRequest = await locals.supabase
            .from("Queue")
            .select("*")
            .eq("userId", userId)
            .eq("strategyId", strategyId)
            .eq("status", "PENDING")
            .order("createdAt", { ascending: true })
            .limit(take);

        if (pendingRequest.error) {
            console.error("Error retrieving the oldest pending entry:", pendingRequest.error);
            throw pendingRequest.error;
        }
        if (pendingRequest.data.length === 0) {
            provisionInstructions({ strategyId, userId, blacklist, locals });
            return json({ status: 202 });
        }
        const queueItems = pendingRequest.data;

        if (!SYSTEM_MODE || +SYSTEM_MODE >= 1) {
            for (const queueItem of queueItems) {
                const update = await locals.supabase
                    .from("Queue")
                    .update({ status: "PROCESSING" })
                    .eq("id", queueItem.id);

                if (update.error) {
                    console.error("Error retrieving the oldest pending entry:", update.error);
                    throw update.error;
                }
            }
        }

        const count = await locals.supabase
            .from("Queue")
            .select("id", { count: "exact" })
            .eq("userId", userId)
            .eq("strategyId", strategyId)
            .eq("status", "PENDING");

        console.log("DB QUEUED (WAITING) INSTRUCTIONS #", count.count);

        if (count.error) {
            console.error("Error retrieving the oldest pending entry:", count.error);
            throw count.error;
        } else if (count.count < PROVISION_THRESHOLD) {
            provisionInstructions({ userId, strategyId, blacklist, params, locals });
        }

        return json({ instructions: queueItems, status: 200 });
    } catch (error) {
        console.error("[INSTRUCTIONS POST<GET> ERROR] /api/instructions", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}

export async function DELETE({ locals, params, request }) {
    try {
        const session = await locals.getSession();
        if (!session) throw redirect(307, "/auth");

        const { queueId } = await request.json();

        const deleteRequest = await locals.supabase.from("Queue").delete().eq("id", queueId);
        if (deleteRequest.error) throw deleteRequest.error;

        return json({ status: deleteRequest.status });
    } catch (error) {
        console.error("[INSTRUCTIONS DELETE ERROR] /api/instructions", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
