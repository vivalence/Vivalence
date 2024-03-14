// {
//   tagId,
//   gameId,
//   blacklist = [],
//   take = 1
//
//   due_lt? = new Date(),
//
//   ?type = [NOUN, VERB, ADJECTIVE, ADVERB, CONJUGATION], etc
//   ?whitelist = [],
// } = inputs;

export default async function (inputs, { supabase }) {
    try {
        const {
            tagIds,
            gameId,
            tags = [],
            blacklist = [],
            due_lt = new Date().toISOString(),
            take = 1
        } = inputs;

        let debt = -take;
        const units = [];

        for (const methodname of ["get_due_units", "get_new_units"]) {
            if (debt >= 0) break;

            const params = {
                tag_ids: tagIds,
                game_id: gameId,
                blacklist: blacklist.length > 0 ? blacklist : null,
                take_limit: Math.abs(debt)
            };

            const { data, error } = await supabase.rpc(methodname, params);

            if (error) throw error;
            if (data.length === 0) continue;

            units.push(...data);
            debt += data.length;
        }

        return units;
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
}
