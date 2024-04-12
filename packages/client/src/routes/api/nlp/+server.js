import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import parseFeats from "./feats.js";
const { SERVICE_NLP_URL } = env;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms * 1000));

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
    try {
        if (["PUNCT", "SPACE"].includes(annotation.upos)) {
            return null;
        }

        const userId = (await getSession()).user.id;

        let unit;
        let query = supabase
            .from("Unit")
            .select(
                `*,
		Memory (id, status,tagId, lastSeen, state, type, lastSeen ),
		_TagToUnit(*, Tag: A (*, Memory (id, status,tagId, lastSeen, state, type, lastSeen ))) `
            )
            .eq("data->>lemmaSpanish", annotation.lemma)
            .eq("objectStatus", "ACTIVE")
            .eq("_TagToUnit.Tag.Memory.userId", userId)
            .eq("Memory.userId", userId)
            .filter("Memory.tagId", "is", null);

        let filterTags = [annotation.upos];
        if (["VERB", "AUX"].includes(annotation.upos)) {
            //     query = query
            //         .filter("_TagToUnit.Tag.data->>branch", "eq", "VerbForm")
            //         .filter("_TagToUnit.Tag.data->>leaf", "eq", annotation.feats.VerbForm);
            //     if (annotation.feats.Tense) {
            //         query = query
            //             .filter("_TagToUnit.Tag.data->>branch", "eq", "Tense")
            //             .filter("_TagToUnit.Tag.data->>leaf", "eq", annotation.feats.Tense);
            //         // .eq("data->>spanish", annotation.token)
            //         // .eq("data->>mood", annotation.feats.ENUM.mood)
            //         // .eq("data->ud->feats->>Tense", annotation.feats.Tense);
            //     }
        } else if (["NOUN", "PROPN"].includes(annotation.upos)) {
            filterTags.push(...[annotation.feats.Number, annotation.feats.Gender]);
        } else if (["ADJ"].includes(annotation.upos)) {
            filterTags.push(...[annotation.feats.Number]);
            if (annotation.feats.Gender) filterTags.push(annotation.feats.Gender);
        } else if (["DET"].includes(annotation.upos)) {
            const feats = annotation.feats;
            filterTags.push(...[feats.Number, feats.Gender, feats.PronType, feats.Definite]);
        }

        query = query
            .in("_TagToUnit.Tag.data->ONTOLOGICAL->>leaf", filterTags)
            .not("_TagToUnit.Tag", "is", null);

        const { data, error } = await query;
        if (error) throw error;

        unit = data.find((u) => u._TagToUnit.length === filterTags.length);

        unit.Tags = unit._TagToUnit.map(({ Tag }) => {
            Tag.Memory = Tag.Memory && Tag.Memory.length > 0 ? Tag.Memory[0] : null;
            return Tag;
        });

        unit.Memory = unit.Memory && unit.Memory.length > 0 ? unit.Memory[0] : null;

        delete unit._TagToUnit;

        // console.log("/api/nlp Unit ", JSON.stringify(unit, null, 2));

        return unit;
    } catch (error) {
        console.error("[NLPU ERROR /api/nlp] Error fetching unit:", error.message);
        console.log("Annotation:\n", annotation);
        console.error(error);
        // console.log("query:\n", query);
        return { error };
    }
}
