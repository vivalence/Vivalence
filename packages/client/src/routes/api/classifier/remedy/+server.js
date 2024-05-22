import { json } from "@sveltejs/kit";
import { handleValidationError } from "./registry.js";
import "./install.js";

export async function POST({ request, locals }) {
    try {
        const { issue } = await request.json();

        const result = await handleValidationError(issue, locals);

        return json({ data: result, status: 200 });
    } catch (err) {
        console.error(`[REMEDY ERROR /api/classifier/remedy]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
