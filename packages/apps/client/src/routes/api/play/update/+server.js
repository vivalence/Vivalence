import { json } from "@sveltejs/kit";
import { getDateTimeInXHours, getTimeDifferenceFromNow } from "$lib/time";
import * as ebisu from "$lib/ebisu";

export async function POST({ locals: { supabase, getSession }, request, ...props }) {
    try {
        const { user } = await getSession();
        const { gameId, unitId, tagId, memoryId, nextPlay, response } = await request.json();

        const now = new Date().toISOString();

        let play;
        let query = supabase
            .from("Play")
            .select("*")
            .eq("memoryId", memoryId)
            .eq("gameId", gameId)
            .eq("userId", user.id);

        if (unitId) query = query.eq("unitId", unitId);
        else query = query.filter("unitId", "is", null);

        if (tagId) query = query.eq("tagId", tagId);
        else query = query.filter("tagId", "is", null);

        let { data: plays, error } = await query.limit(1);
        if (error) throw error;
        play = plays[0];

        if (!play) {
            const { data: updatedPlay, error: createError } = await supabase
                .from("Play")
                .insert([
                    {
                        unitId,
                        tagId,
                        gameId,
                        userId: user.id,
                        memoryId,
                        nextPlay,
                        lastPlay: now,
                        history: [{ response, nextPlay, now }]
                    }
                ])
                .single()
                .select("id, nextPlay");

            if (createError) throw createError;

            return json({
                data: { play: updatedPlay },
                status: 200
            });
        } else {
            const updatedHistory = [...play.history, { response, nextPlay, now }];

            const { data: updatedPlay, error: updateError } = await supabase
                .from("Play")
                .update({
                    history: updatedHistory,
                    nextPlay,
                    lastPlay: now,
                    updatedAt: now
                })
                .eq("id", play.id)
                .select("id, nextPlay")
                .single();

            if (updateError) throw updateError;

            return json({
                data: { play: updatedPlay },
                status: 200
            });
        }
    } catch (err) {
        console.error(`[PLAY ERROR /api/play]`, err.message);
        console.error(err);
        return json({ error: err, status: 500 });
    }
}

// async function create({ unitId, gameId, response, nextPlay }) {
//     const lastPlay = new Date();

//     const data = {
//         gameId,
//         unitId,
//         nextPlay,
//         lastPlay,
//         history: [{ response, nextPlay, now: lastPlay }]
//     };
//     const created = await prisma.gameUnitRelation.create({ data });
//     return created;
// }

// async function read({ unitId, gameId }) {
//     const queryResult = await prisma.gameUnitRelation.findFirst({
//         where: { unitId, gameId },
//         include: { game: { select: { type: true } } }
//     });
//     return queryResult;
// }

// async function update({ unitId, gameId, nextPlay, response }, gameUnitRelation) {
//     const now = new Date();
//     const history = [...gameUnitRelation.history, { response, nextPlay, now }];

//     const gameUnitRelationUpdate = await prisma.gameUnitRelation.update({
//         where: { id: gameUnitRelation.id },
//         data: { history, nextPlay, lastPlay: now }
//     });
//     return gameUnitRelationUpdate;
// }

// async function handle({ gameId, unitId, nextPlay, response }) {
//     const input = { gameId, unitId, nextPlay, response };

//     let gameUnitRelation = await read(input);

//     if (gameUnitRelation) {
//         gameUnitRelation = await update(input, gameUnitRelation);
//     } else {
//         gameUnitRelation = await create(input);
//     }

//     return gameUnitRelation;
// }

// export default {
//     create,
//     read,
//     update,
//     handle
// };

// // const getDelayTime = (gameUnitRelation, nextReviewInHours) => {// difference between (reviewItem.lastreview to now) and (nextreview to now) in hours const lastPredictionDifference = (reviewItem.nextReview - gameUnitRelation.lastReview) / (1000 * 60 * 60); console.log("item", gameUnitRelation.word.spanish); console.log("previous", lastPredictionDifference); console.log("next", nextReviewInHours); const delay = nextReviewInHours - lastPredictionDifference; return delay;};

// function getUnitStatus(elapsedTime, response) {
//     if (elapsedTime > 24 * 7 && ["GRADUATE", "KNOWN"].includes(response)) {
//         return "KNOWN";
//     } else {
//         return "LEARNING";
//     }
// }
// function getDefaultEbisuModel(response) {
//     let defautlModel = {};
//     switch (response) {
//         case "GRADUATE":
//             defautlModel.tau = 24;
//             break;
//         case "KNOWN":
//             defautlModel.tau = 3.4;
//             break;
//         case "UNKNOWN":
//             defautlModel.tau = 0.26;
//             break;
//         default:
//             throw new Error(`Invalid response: ${response}`);
//     }
//     return ebisu.getDefaultModel(defautlModel);
// }
// function updateEbisuModel(model, response, elapsedTime) {
//     switch (response) {
//         case "GRADUATE":
//             model = ebisu.updateModel(model, 1, 1, elapsedTime);
//             model = ebisu.scaleModel(model, 5);
//             break;
//         case "KNOWN":
//             model = ebisu.updateModel(model, 1, 1, elapsedTime);
//             break;
//         case "UNKNOWN":
//             model = ebisu.updateModel(model, 0, 1, elapsedTime);
//             break;
//         default:
//             throw new Error(`Invalid response: ${response}`);
//     }

//     return model;
// }
