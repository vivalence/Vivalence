import { json } from "@sveltejs/kit";
import enforce from "./enforce.js";

export async function POST({ request, locals, ...props }) {
    try {
        const feats = await enforce(locals);
        return json({ data: feats });
    } catch (err) {
        console.error(
            `[VALIDATE ONTOLOGY ERROR /api/classifier/validate/ontology/tags]`,
            err.message
        );
        console.error(err);
        return json({ status: 500, error: err });
    }
}
