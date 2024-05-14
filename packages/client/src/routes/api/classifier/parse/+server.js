import { json } from "@sveltejs/kit";
import nlp from "$lib/server/nlp";
import annotate from "./annotate.js";

export async function POST({ request, locals, ...props }) {
    try {
        const { text } = await request.json();
        const { analysis, error } = await nlp({ text });

        const process = async (token) => {
            const meta = {
                token: token.token,
                index: token.index,
                start_char: token.start_char,
                end_char: token.end_char
            };
            const annotation = annotate(token);

            const { data: unit } = await locals.post("/api/units/fromAnnotation", { annotation });

            // console.log("\n\n\n\n\n\n");
            // console.log("token", token);
            // console.log("annotation", annotation, meta);
            // console.log("unit", unit);

            // const tags = unit.tags;
            return { annotation, meta, unit };
        };

        const annotations = await Promise.all(
            analysis.sentences.map(async (sentence) => {
                return await Promise.all(sentence.tokens.map(process));
            })
        );

        console.log("annotations", annotations);

        return json({ data: annotations, status: 200 });
    } catch (err) {
        console.error(`[CLASSIFIER ERROR /api/classifier/parse]`, err.message);
        console.error(err);
        // console.error(`[input:text]\n`, text);
        return json({ status: 500, error: err });
    }
}
