import { json } from "@sveltejs/kit";
import provisionInstructions from "./provision";

const PROVISION_THRESHOLD = 5;

export async function POST({ locals, params, request }) {
  try {
    const session = await locals.getSession();
    if (!session) throw redirect(307, "/auth");

    const userId = session.user.id;
    let { strategyId, take, blacklist = {} } = await request.json();

    console.log("getting instructions", strategyId, take, blacklist);

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

    if (count.error) {
      console.error("Error retrieving the oldest pending entry:", count.error);
      throw count.error;
    } else if (count.count < PROVISION_THRESHOLD) {
      provisionInstructions({ userId, strategyId, blacklist, locals });
    }

    return json({ data: queueItems, status: 200 });
  } catch (error) {
    console.error("[INSTRUCTIONS POST<GET> ERROR] /api/instructions/get", error.message);
    console.error(error);
    return json({ error, status: 500 });
  }
}
