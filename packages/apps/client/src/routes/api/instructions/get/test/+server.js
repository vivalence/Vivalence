import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import { make } from "../provision";
import localStrategy from "./strategies";

export async function POST({ locals, params, request }) {
    // console.log(await locals.getSession());

    try {
        const { userId, strategyId } = {
            strategyId: "caab159c-8689-4812-9b16-5f0bec7e7530",
            userId: "9691006d-51e3-4db4-b0d6-d3137d6c13a4"
        };
        // const { userId,  } = await request.json();
        let blacklist = { tags: [], units: [] };

        const instructions = await make({
            strategyId: localStrategy.id,
            userId: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b",
            blacklist,
            locals,
            dry: true,
            local: localStrategy.provision
        });

        return json({ instructions, status: 200 });
    } catch (error) {
        console.error("[INSTRUCTIONS POST<GET> ERROR] /api/instructions", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
