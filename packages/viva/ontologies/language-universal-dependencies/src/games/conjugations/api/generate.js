import Mustache from "mustache";

// could also be tag[branch=VerbForm;leaf=Inf]
const INFINITIVE_TAG = "clrzb0g3v000xg0lg85jltdwy";

export default async function generate(inputs, locals) {
    const { gameId, tags } = inputs;

    const { data: game, error: errorGame } = await locals.supabase
        .from("Game")
        .select(`id, data`)
        .eq("id", gameId)
        .single();
    if (errorGame) throw errorGame;

    //
    // POST TENSE TAG
    //
    const tenseTag = await locals
        .client("tags/fromTagIds", {
            tagIds: [tags.tense.id]
        })
        .single();

    //
    // POST INFINITIVE UNIT
    //
    const infinitiveVerb = await locals
        .client("units/fromTagIds", {
            tagIds: [INFINITIVE_TAG, tags.verb.id]
        })
        .single();

    //
    // POST CONJUGATION UNITS
    //
    const tagIds = [tags.verb.id, tags.tense.id, tags.mood.id];
    const conjugationUnits = await locals.client("units/fromTagIds", { tagIds }).ok();
    if (!conjugationUnits.length !== 6)
        new Error("not the right number of conjugation units found", tags);

    const units = conjugationUnits.sort(sortByPerformer);

    // TODO: add tag[Person&Number] to scope.unit.tags
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
            tags: Object.keys(tags).map((key) => ({ id: tags[key].id, role: key })),
            units: conjugations.map(({ scope }) => scope.unit),
            game: { id: gameId }
        }
    };
    return instruction;
}

export const sortByPerformer = (a, b) => {
    const sumSortValues = (unit) =>
        unit.tags.reduce((sum, tag) => {
            const { leaf, branch } = tag.data.ONTOLOGICAL;
            if (branch === "person") return sum + parseInt(leaf);
            if (branch === "number") return leaf === "sing" ? sum + 0 : sum + 10;
            return sum;
        }, 0);

    return sumSortValues(a) - sumSortValues(b);
};
