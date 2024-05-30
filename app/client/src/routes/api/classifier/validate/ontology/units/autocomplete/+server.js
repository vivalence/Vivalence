import { json } from "@sveltejs/kit";
import autocomplete from "./autocomplete.js";

export async function POST({ request, locals }) {
    try {
        const input = await request.json();

        const data = await autocomplete(input, locals);

        return json({ data });
    } catch (err) {
        console.error(
            `[VALIDATE ONTOLOGY ERROR classifier/validate/ontology/units/autocomplete]`,
            err.message
        );
        console.error(err);
        return json({ status: 500, error: err });
    }
}
