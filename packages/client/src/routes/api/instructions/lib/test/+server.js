import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import provisionInstructions from "../provision";
import localStrategy from "./test";

export async function GET({ locals, params, request }) {
    try {
        // const { userId, strategyId } = await request.json();
        const { userId, strategyId } = {
            strategyId: "caab159c-8689-4812-9b16-5f0bec7e7530",
            userId: "9691006d-51e3-4db4-b0d6-d3137d6c13a4"
        };
        const blacklist = { tags: [], units: [] };

        await provisionInstructions({
            strategyId,
            userId,
            blacklist,
            locals,
            dry: true,
            local: localStrategy
        });
    } catch (error) {
        console.error("[INSTRUCTIONS POST<GET> ERROR] /api/instructions", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
