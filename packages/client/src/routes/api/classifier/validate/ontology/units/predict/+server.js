import { json } from "@sveltejs/kit";
import predict from "./predict.js";

export async function POST({ request, locals }) {
    try {
        const { space } = await request.json();

        const issues = await predict({ space }, locals);

        return json({ data: issues, status: 200 });
    } catch (err) {
        console.error(
            `[VALIDATE ONTOLOGY ERROR classifier/validate/ontology/units/predict]`,
            err.message
        );
        console.error(err);
        return json({ status: 500, error: err });
    }
}
