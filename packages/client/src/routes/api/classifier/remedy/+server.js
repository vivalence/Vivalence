import { json } from "@sveltejs/kit";
import registerHandlers, { handleValidationError } from "./registry.js";
import unit from "./unit";

registerHandlers(unit);

export async function POST({ request, locals, ...props }) {
    try {
        const { error } = await request.json();

        error.locals = locals;

        const result = await handleValidationError(error);

        return json({
            data: result,
            status: 200
        });
    } catch (err) {
        console.error(`[REMEDY ERROR /api/classifier/remedy]`, err.message);
        console.error(err);
        // console.error(`[input:text]\n`, text);
        return json({ status: 500, error: err });
    }
}
