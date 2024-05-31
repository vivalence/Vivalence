import { json } from "@sveltejs/kit";
export async function POST({ fetch, locals, request }) {
    const { text } = await request.json();

    const { data: annotations, error: nlpError } = await locals.post(
        `/api/classifier/annotate/fromText`,
        { text }
    );
    if (nlpError) throw nlpError;

    const tokens = await Promise.all(
        annotations.flat().map(async (annotation) => {
            const input = { annotation };
            const { data: units } = await locals.post("/api/units/fromAnnotation", input);
            return { annotation, unit: units[0] };
        })
    );
    return json({ data: tokens, status: 200 });
}
