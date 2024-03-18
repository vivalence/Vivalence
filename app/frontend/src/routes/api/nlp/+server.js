import { json } from "@sveltejs/kit";
import { SERVICE_NLP_URL } from "$env/static/private";
import parseFeats from "./feats.js";

export async function GET({ fetch, locals, ...props }) {
    try {
        const input = locals.params();

        const response = await fetch(SERVICE_NLP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: input.sentence,
                language: "es",
                processors: "tokenize,mwt,pos,lemma,depparse"
            })
        });
        const analysis = await response.json();

        const promises = [];
        for (const [i, sentence] of analysis.sentences.entries()) {
            for (const annotation of sentence.tokens) {
                annotation.feats = parseFeats(annotation.feats);
                promises.push(
                    (async (annotation) => {
                        annotation.unit = await findUnit(annotation, locals);
                    })(annotation)
                );
            }
        }
        await Promise.all(promises);

        return json({ data: analysis, status: 200 });
    } catch (err) {
        console.error(`[NLP ERROR /api/nlp]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}

async function findUnit(annotation, { supabase, getSession }) {
    if (["PUNCT", "SPACE"].includes(annotation.upos)) {
        return null;
    }
    const userId = (await getSession()).user.id;

    let query = supabase
        .from("Unit")
        .select(
            `*,
            MemoryModel:MemoryModel (
                id,
                status,
                lastSeen
            )`
        )
        .eq("MemoryModel.userId", userId);

    if (["VERB"].includes(annotation.upos)) {
        if (annotation.feats.Tense) {
            query = query
                .eq("data->ud->>lemma", annotation.lemma)
                .eq("data->>spanish", annotation.token)
                .eq("data->>mood", annotation.feats.ENUM.mood)
                .eq("data->ud->feats->>Tense", annotation.feats.Tense);
        } else {
            query = query
                .eq("data->ud->>lemma", annotation.lemma)
                .eq("data->ud->feats->>VerbForm", annotation.feats.VerbForm);
        }
    } else {
        query = query.eq("data->>lemmaSpanish", annotation.lemma);
    }

    const { data, error } = await query.limit(1).single();

    if (error) {
        console.error("[NLPU ERROR /api/nlp] Error fetching unit:", error.message);
        console.error(error);
        console.log("Annotation:\n", annotation);
        console.log("query:\n", query);
        return null;
    }

    return {
        ...data,
        memoryModel: data.MemoryModel.length > 0 ? data.MemoryModel[0] : null
    };
}
