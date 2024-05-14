import { json } from "@sveltejs/kit";
import validator from "./validator";

export async function POST({ request, locals, ...props }) {
    try {
        const { unit } = await request.json();

        const validation = await validator(unit, locals);

        return json({
            data: validation,
            status: 200
        });
    } catch (err) {
        console.error(`[VALIDATE ERROR /api/classifier/validate/unit]`, err.message);
        console.error(err);
        // console.error(`[input:text]\n`, text);
        return json({ status: 500, error: err });
    }
}
