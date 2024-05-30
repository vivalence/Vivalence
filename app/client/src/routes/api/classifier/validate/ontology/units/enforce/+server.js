import { json } from "@sveltejs/kit";
import enforce from "./enforce.js";

export async function POST({ request, locals }) {
    try {
        const {} = await request.json();

        const issues = await enforce({}, locals);

        return json({ data: issues });
    } catch (err) {
        console.error(
            `[VALIDATE ONTOLOGY ERROR classifier/validate/ontology/units/enforce]`,
            err.message
        );
        console.error(err);
        return json({ status: 500, error: err });
    }
}
