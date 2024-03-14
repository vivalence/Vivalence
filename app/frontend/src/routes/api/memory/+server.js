import { json } from "@sveltejs/kit";
import { getDateTimeInXHours, getTimeDifferenceFromNow } from "$lib/time";
import * as ebisu from "$lib/ebisu";

// { gameId, gameType, unitId, response }
export async function POST({ locals: { supabase, getSession }, request, ...props }) {
    try {
        const { gameType, gameId, unitId, response } = await request.json();
        const { user } = await getSession();

        let nextPlay, memory;

        let { data: memories, error } = await supabase
            .from("MemoryModel")
            .select("id, unitId, userId, state, lastSeen, history")
            .eq("unitId", unitId)
            .eq("userId", user.id)
            .limit(1);

        if (error) throw error;

        memory = memories[0];

        if (!memory) {
            const model = ebisu.initiateModel(response);
            const nextReviewTime = ebisu.predictNextReviewTime(model);
            const nextPlay = getDateTimeInXHours(nextReviewTime);
            const now = new Date().toISOString();

            const { data: createdMemory, error } = await supabase
                .from("MemoryModel")
                .insert([
                    {
                        type: "EBISU_v2",
                        status: "LEARNING",
                        state: model,
                        lastSeen: now,
                        history: [{ gameType, response, model, nextPlay, date: now }],
                        unitId: unitId,
                        userId: user.id
                    }
                ])
                .single()
                .select("id, state, lastSeen");

            if (error) throw error;
            return json({
                data: {
                    memoryModel: createdMemory,
                    nextPlay
                },
                error: null
            });
        } else {
            const now = new Date().toISOString();
            const elapsedTime = getTimeDifferenceFromNow(memory.lastSeen);
            const model = ebisu.updateModel(memory.state, response, elapsedTime);
            const nextReviewTime = ebisu.predictNextReviewTime(model);
            const nextPlay = getDateTimeInXHours(nextReviewTime);

            const history = [...memory.history, { gameType, response, model, nextPlay, date: now }];

            const { data: updatedMemoryModel, error } = await supabase
                .from("MemoryModel")
                .update({
                    state: model,
                    history,
                    lastSeen: now,
                    updatedAt: now
                })
                .eq("id", memory.id)
                .single()
                .select("id, state, lastSeen");

            if (error) throw error;
            return json({
                data: {
                    memoryModel: updatedMemoryModel,
                    nextPlay
                },
                status: 200
            });
        }
    } catch (err) {
        console.error(`[MEMORY ERROR /api/memory]`, err.message);
        console.error(err);
        return json({ error: err, status: 500 });
    }
}

// async function handle({ unitId, gameType, response }) {
//     const input = { unitId, gameType, response };

//     let memoryModel = await read(input);

//     if (memoryModel) {
//         const updated = await update(input, memoryModel);
//         memoryModel = updated.memoryModel;
//         nextPlay = updated.nextPlay;
//     } else {
//         const created = await create(input);
//         memoryModel = created.memoryModel;
//         nextPlay = created.nextPlay;
//     }
//     // console.log("memoryModel", unit && unit.data.spanish, response, nextPlay);

//     return { memoryModel, nextPlay };
// }

// async function create({ unitId, response, gameType }) {
//     const model = getDefaultEbisuModel(response);
//     const nextReviewTime = ebisu.predictNextReviewTime(model);
//     const nextPlay = getDateTimeInXHours(nextReviewTime);
//     const now = new Date();

//     const data = {
//         unit: { connect: { id: unitId } },
//         type: "EBISU_v2",
//         status: "LEARNING",
//         lastSeen: now,
//         state: model,
//         history: [{ gameType, response, model, nextPlay, now }]
//     };

//     const created = await prisma.memoryModel.create({ data });

//     return { memoryModel: created, nextPlay };
// }

// async function read({ unitId }) {
//     const queryResult = await prisma.memoryModel.findFirst({
//         where: { unitId },
//         include: { unit: true }
//     });
//     return queryResult;
// }

// async function update({ unitId, response, gameType }, memoryModel) {
//     const now = new Date();
//     const elapsedTime = getTimeDifferenceFromNow(memoryModel.lastSeen);
//     const model = updateEbisuModel(memoryModel.state, response, elapsedTime);
//     const nextPlay = getDateTimeInXHours(ebisu.predictNextReviewTime(model));

//     const history = [
//         ...memoryModel.history,
//         {
//             gameType,
//             response,
//             model,
//             nextPlay,
//             now
//         }
//     ];

//     const update = await prisma.memoryModel.update({
//         where: { id: memoryModel.id },
//         data: {
//             state: model,
//             status: "LEARNING",
//             lastSeen: now,
//             history
//         }
//     });
//     return { memoryModel: update, nextPlay };
// }

// // const getDelayTime = (gameUnitRelation, nextReviewInHours) => {// difference between (reviewItem.lastreview to now) and (nextreview to now) in hours const lastPredictionDifference = (reviewItem.nextReview - gameUnitRelation.lastReview) / (1000 * 60 * 60); console.log("item", gameUnitRelation.word.spanish); console.log("previous", lastPredictionDifference); console.log("next", nextReviewInHours); const delay = nextReviewInHours - lastPredictionDifference; return delay;};

// // function getUnitStatus(elapsedTime, response) {if (elapsedTime > 24 * 7 && ["GRADUATE", "KNOWN"].includes(response)) {return "KNOWN";} else {return "LEARNING";}}

// // function getDefaultEbisuModel(response) {let defautlModel = {}; switch (response) {case "GRADUATE": defautlModel.tau = 24; break; case "KNOWN": defautlModel.tau = 3.4; break; case "UNKNOWN": defautlModel.tau = 0.26; break; default: throw new Error(`Invalid response: ${response}`);} return ebisu.getDefaultModel(defautlModel);}

// // function updateEbisuModel(model, response, elapsedTime) {
// //     switch (response) {
// //         case "GRADUATE":
// //             model = ebisu.updateModel(model, 1, 1, elapsedTime);
// //             model = ebisu.scaleModel(model, 5);
// //             break;
// //         case "KNOWN":
// //             model = ebisu.updateModel(model, 1, 1, elapsedTime);
// //             break;
// //         case "UNKNOWN":
// //             model = ebisu.updateModel(model, 0, 1, elapsedTime);
// //             break;
// //         default:
// //             throw new Error(`Invalid response: ${response}`);
// //     }

// //     return model;
// // }
