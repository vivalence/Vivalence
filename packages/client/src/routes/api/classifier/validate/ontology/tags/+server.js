import { json } from "@sveltejs/kit";
import featsCheck from "./feats/all-feat-tags-exist.js";

export async function POST({ request, locals, ...props }) {
    try {
        // const {} = await request.json();
        const feats = await featsCheck(locals);
        return json({ data: feats });
    } catch (err) {
        console.error(`[VALIDATE ONTOLOGY ERROR /api/classifier/validate/tags]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
