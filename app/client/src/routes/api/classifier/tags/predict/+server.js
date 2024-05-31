import { json } from "@sveltejs/kit";
import predict from "./predict.js";

export async function POST({ request, locals, ...props }) {
    try {
        const input = await request.json();
        const issues = await predict(input, locals);
        return json({ data: issues });
    } catch (err) {
        console.error(
            `[VALIDATE ONTOLOGY ERROR /api/classifier/validate/ontology/tags/predict]`,
            err.message
        );
        console.error(err);
        return json({ status: 500, error: err });
    }
}
