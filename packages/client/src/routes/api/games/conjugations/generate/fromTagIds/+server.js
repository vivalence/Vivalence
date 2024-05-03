import { json } from "@sveltejs/kit";
import Mustache from "mustache";
import { env } from "$env/dynamic/private";
import { sortByPerformer } from "../lib";
const { SYSTEM_MODE } = env;

// could also be tag[branch=VerbForm;leaf=Inf]
const INFINITIVE_TAG = "clrzb0g3v000xg0lg85jltdwy";

export async function POST({ fetch, locals, request }) {
    try {
        const { gameId, tags } = await request.json();

        const { data: game, error: errorGame } = await locals.supabase
            .from("Game")
            .select(`id, data`)
            .eq("id", gameId)
            .single();
        if (errorGame) throw errorGame;

        //
        // POST TENSE TAG
        //
        const { data: tenseTags, error: tenseError } = await locals.post("/api/tags/fromTagIds", {
            tagIds: [tags.tense.id]
        });
        if (tenseError || !tenseTags) throw error || new Error("No tense tags found");
        const tenseTag = tenseTags[0];

        //
        // POST INFINITIVE UNIT
        //
        const { data: infinitiveUnits, error: infinitiveError } = await locals.post(
            "/api/units/fromTagIds",
            {
                tagIds: [INFINITIVE_TAG, tags.verb.id]
            }
        );
        if (infinitiveError || !infinitiveUnits)
            throw error || new Error("No infinitive units found");
        const infinitiveVerb = infinitiveUnits[0];

        //
        // POST CONJUGATION UNITS
        //
        const tagIds = [tags.verb.id, tags.tense.id];
        const { data: conjugationUnits, error: conjugationsError } = await locals.post(
            "/api/units/fromTagIds",
            { tagIds }
        );
        if (conjugationsError || !conjugationUnits)
            throw error || new Error("No conjugation units found");
        const units = conjugationUnits.sort(sortByPerformer);

        const conjugations = [];
        for (const [index, unit] of units.entries()) {
            conjugations.push({
                spoken: `${unit.data.english}`,
                learning: `${unit.data.spanish}`,
                scope: { unit: { id: unit.id, tags: tagIds.map((id) => ({ id })) } },
                meta: { index }
            });
        }

        //
        // INSTRUCTIONS
        //
        const instruction = {
            type: "CONJUGATIONS",
            instruction: {
                tense: tenseTag.data.ONTOLOGICAL.leaf,
                verb: {
                    spoken: infinitiveVerb.data.english,
                    learning: infinitiveVerb.data.spanish
                },
                conjugations
            },
            scope: {
                tags,
                units: conjugations.map((c) => ({ id: c.scope.unit.id })),
                game: { id: gameId }
            }
        };
        return json({ data: instruction, status: 200 });
    } catch (error) {
        console.error("[GENERATE ERROR] /api/games/conjugation/generate/fromTagIds", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}
