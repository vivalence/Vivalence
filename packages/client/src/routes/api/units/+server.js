import { json } from "@sveltejs/kit";

export async function GET({ fetch, locals, ...props }) {
    try {
        const {
            tagIds,
            gameId,
            blacklist = [],
            due_lt = new Date().toISOString(),
            take = 1
        } = locals.params();

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

            const { data, error } = await locals.supabase.rpc(methodname, params);

            if (error) throw error;
            if (data.length === 0) continue;

            units.push(...data);
            debt += data.length;
        }

        return json({ data: units, error: null });
    } catch (err) {
        console.error(`ERROR /api/units GET:`, err.message);
        return json({ status: 500, error: err });
    }
}

export async function POST({ fetch, locals: { supabase, post }, request }) {
    try {
        const { gameId, gameType, unitId, response } = await request.json();

        const { data: memoryData, error: memoryError } = await post("/api/memory", {
            gameId,
            gameType,
            unitId,
            response
        });

        if (memoryError) throw memoryError;

        const { data: playData, error: playError } = await post("/api/play", {
            gameId,
            memoryId: memoryData.memory.id,
            nextPlay: memoryData.nextPlay,
            unitId,
            response
        });

        const { data: unit } = await supabase.from("Unit").select("data").eq("id", unitId).single();

        // console.log(
        //     "UNIT ",
        //     unit.data.spanish,
        //     memoryData.memory.status,
        //     `${Math.round((memoryData.nextReviewIn / 7) * 100) / 100} days`,
        //     memoryData.memoryStatusChange ? "status change" : "no change",
        //     response
        // );

        if (playError) throw playError;

        return json({
            data: { ...playData, ...memoryData },
            status: 200
        });
    } catch (err) {
        console.error(`ERROR /api/units POST:`, err.message);
        console.error(err);
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
