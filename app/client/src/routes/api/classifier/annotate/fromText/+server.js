import { json } from "@sveltejs/kit";

import nlp from "$lib/server/nlp";
import annotate from "./annotate.js";

export async function POST({ request, locals, ...props }) {
    try {
        const { text } = await request.json();

        const { analysis, error } = await nlp({ text });
        if (error) throw error;

        const annotations = analysis.sentences.map((sentence) => {
            return sentence.tokens.map(annotate);
        });

        return json({ data: annotations, status: 200 });
    } catch (err) {
        console.error(`[CLASSIFIER ERROR /api/classifier/annotate/fromText]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
