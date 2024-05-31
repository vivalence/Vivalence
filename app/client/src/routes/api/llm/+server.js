import { json } from "@sveltejs/kit";
import llms from "$lib/server/llms";

export async function GET({ fetch, locals, ...props }) {
    try {
        const inputs = locals.params();
        // console.log("[LLM REQUEST]", inputs);
        const response = await llms[inputs.provider.api](inputs);
        // console.log("[LLM RESPONSE]", response);
        return json({ data: response, error: null });
    } catch (err) {
        console.error(`[LLM ERROR /api/llm]`, err.message);
        console.error(err);
        return json({ error: err, status: 500 });
    }
}
