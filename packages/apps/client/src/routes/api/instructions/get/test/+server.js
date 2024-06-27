import { env } from "$env/dynamic/private";
const { SYSTEM_MODE } = env;
import { json } from "@sveltejs/kit";

import { make } from "../provision";
import localStrategy from "./strategies";

export async function POST({ locals, params, request }) {
    try {
        let blacklist = { tags: [], units: [] };

        console.log("make");
        const instructions = await make({
            strategyId: localStrategy.id,
            userId: "1f7bc403-6d2d-4a7b-b52f-3bfeef0d590b",
            blacklist,
            locals,
            dry: true,
            local: localStrategy.provision
        });
        console.log("made", instructions);

        return json({ instructions, status: 200 });
    } catch (error) {
        console.error("[INSTRUCTIONS POST<GET> ERROR] /api/instructions", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
