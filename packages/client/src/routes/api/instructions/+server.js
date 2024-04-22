import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";
import provisionInstructions from "./lib/provision";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms * 1000));

const PROVISION_THRESHOLD = 5;

export async function POST({ locals, params, request }) {
    try {
        const session = await locals.getSession();
        if (!session) throw redirect(307, "/auth");

        const { strategyId, take, blacklist = {} } = await request.json();
        const userId = session.user.id;

        blacklist.units = blacklist.units || [];
        blacklist.tags = blacklist.tags || [];
        blacklist.instructions = blacklist.instructions || [];

        const nextInstructions = await locals.supabase
            .from("Queue")
            .select("*")
            .not("id", "in", `(${blacklist.instructions.join(",")})`)
            .eq("userId", userId)
            .eq("strategyId", strategyId)
            .order("createdAt", { ascending: true })
            .order("index", { ascending: true })
            .limit(take);

        if (nextInstructions.error) {
            console.error("Error retrieving the oldest pending entry:", nextInstructions.error);
            throw nextInstructions.error;
        }
        if (nextInstructions.data.length < take) {
            // console.log("nextInstructions.data.length < take", nextInstructions.data.length, take);
            provisionInstructions({ strategyId, userId, blacklist, locals });
            return json({ status: 202 });
        }
        const queueItems = nextInstructions.data;
        blacklist.instructions.push(...queueItems.map((u) => u.id));

        const count = await locals.supabase
            .from("Queue")
            .select("id", { count: "exact" })
            .eq("userId", userId)
            .eq("strategyId", strategyId)
            .not("id", "in", `(${blacklist.instructions.join(",")})`);

        // console.log("count.count < PROVISION_THRESHOLD", count.count, PROVISION_THRESHOLD);

        if (count.error) {
            console.error("Error retrieving the oldest pending entry:", count.error);
            throw count.error;
        } else if (count.count < PROVISION_THRESHOLD) {
            provisionInstructions({ userId, strategyId, blacklist, locals });
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
