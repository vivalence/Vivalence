import { json } from "@sveltejs/kit";

export async function GET({ fetch, locals, ...props }) {
    // console.log("GET /api/tags", locals.params());
    try {
        const {
            gameId,
            blacklist = [],
            whitelist = [],
            due_lt = new Date().toISOString(),
            take = 1
        } = locals.params();
        let debt = -take;
        const tags = [];
        for (const methodname of ["get_due_tags", "get_new_tags"]) {
            if (debt >= 0) break;
            const params = {
                game_id: gameId,
                blacklist: blacklist.length > 0 ? blacklist : null,
                whitelist: whitelist.length > 0 ? whitelist : null,
                take_limit: Math.abs(debt)
            };
            const { data, error } = await locals.supabase.rpc(methodname, params);
            if (error) throw error;
            if (data.length === 0) continue;
            tags.push(...data);
            debt += data.length;
        }
        return json({ data: tags, error: null });
    } catch (err) {
        console.error(`ERROR /api/tags GET:`, err.message);
        return json({ status: 500, error: err });
    }
}

export async function POST({ fetch, locals: { supabase, post }, request }) {
    const params = await request.json();
    try {
        const { gameId, gameType, tagId, unitId, response } = params;

        const { data: memoryData, error: memoryError } = await post("/api/memory", {
            gameId,
            gameType,
            unitId,
            tagId,
            response
        });

        if (memoryError) throw memoryError;

        const { data: playData, error: playError } = await post("/api/play", {
            gameId,
            memoryId: memoryData.memory.id,
            nextPlay: memoryData.nextPlay,
            unitId,
            tagId,
            response
        });

        const { data: tag } = await supabase.from("Tag").select("data").eq("id", tagId).single();

        if (playError) throw playError;

        return json({
            data: { ...tag, ...playData, ...memoryData },
            status: 200
        });
    } catch (err) {
        console.error(`ERROR /api/tags POST:`, err.message);
        console.error(err);
        console.error(params);
        return json({ status: 500, error: err });
    }
}

// POST /api/memory data {
//   memory: {
//     id: '56ad28ad-aee0-4aae-af56-81e5de37e145',
//     state: [ 4.00818272051485, 4.008182720260797, 24.807831925750413 ],
//     lastSeen: '2024-03-11T18:41:45.879'
//   },
//   nextPlay: '2024-03-12T04:27:18.215Z'
// }
// /api/play RESPONSE  {
//   play: {
//     id: '059d6591-6c39-452c-827a-b4b1c0f79b61',
//     createdAt: '2024-03-11T18:38:33.001',
//     updatedAt: '2024-03-11T18:41:45.948',
//     history: [ [Object], [Object], [Object], [Object] ],
//     nextPlay: '2024-03-12T04:27:18.215',
//     lastPlay: '2024-03-11T18:41:45.948',
//     unitId: 'clnt09icp000kg0nu822puicy',
//     gameId: 'clqcr75ai0002g04mem2ugyo6',
//     userId: '9691006d-51e3-4db4-b0d6-d3137d6c13a4',
//     memoryId: '56ad28ad-aee0-4aae-af56-81e5de37e145'
//   }
// }
