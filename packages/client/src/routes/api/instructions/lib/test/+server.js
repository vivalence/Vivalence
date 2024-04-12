import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import provisionInstructions from "../provision";
import localStrategy from "./test";

export async function POST({ locals, params, request }) {
    try {
        const { userId, strategyId } = await request.json();
        // console.log("userId", await locals.getSession(), userId);
        const blacklist = [];

        const instructions = provisionInstructions({
            strategyId,
            userId,
            blacklist,
            locals,
            dry: true
            // local: localStrategy
        });

        return json({ instructions, status: 200 });
    } catch (error) {
        console.error("[INSTRUCTIONS POST<GET> ERROR] /api/instructions", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
