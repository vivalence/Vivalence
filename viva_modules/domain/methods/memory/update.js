import { getDateTimeInXHours, getTimeDifferenceFromNow } from "./lib/time.js";
import * as ebisu from "./lib/ebisu.js";
import { getStatus } from "./lib/memory.js";

export default async function (body, runtime) {
  const { gameType, gameId, tagId, unitId, response } = body;
  const { user } = await runtime.locals.getSession();

  let memory, nextPlay;

  let query = runtime.locals.supabase
    .from("Memory")
    .select("id, unitId, tagId, userId, state, status, lastSeen, history")
    .eq("userId", user.id);

  if (unitId) query = query.eq("unitId", unitId);
  else query = query.filter("unitId", "is", null);

  if (tagId) query = query.eq("tagId", tagId);
  else query = query.filter("tagId", "is", null);

  const { data: memories, error } = await query.limit(1);
  if (error) throw error;

  memory = memories[0];

  if (!memory) {
    const model = ebisu.initiateModel(response);
    const nextReviewTime = ebisu.predictNextReviewTime(model);
    const nextPlay = getDateTimeInXHours(nextReviewTime);
    const now = new Date().toISOString();

    const history = [{ gameType, response, model, nextPlay, date: now }];
    const status = getStatus(nextReviewTime, history);

    const { data: createdMemory, error } = await runtime.locals.supabase
      .from("Memory")
      .insert([
        {
          type: "EBISU_v2",
          status,
          state: model,
          lastSeen: now,
          history,
          userId: user.id,
          unitId,
          tagId,
        },
      ])
      .single()
      .select("id, state, status, lastSeen");

    if (error) throw error;
    return {
      memory: createdMemory,
      nextPlay,
    };
  } else {
    const now = new Date().toISOString();
    const elapsedTime = getTimeDifferenceFromNow(memory.lastSeen);
    const model = ebisu.updateModel(memory.state, response, elapsedTime);
    const nextReviewIn = ebisu.predictNextReviewTime(model);
    const nextPlay = getDateTimeInXHours(nextReviewIn);

    const history = [...memory.history, { gameType, response, model, nextPlay, date: now }];
    const status = getStatus(nextReviewIn, history);

    const { data: updatedMemory, error } = await runtime.locals.supabase
      .from("Memory")
      .update({
        state: model,
        status,
        history,
        lastSeen: now,
        updatedAt: now,
      })
      .eq("id", memory.id)
      .single()
      .select("id, state, status, lastSeen");

    if (error) throw error;
    return {
      memory: updatedMemory,
      nextReviewIn,
      nextPlay,
      memoryStatusChange: status !== memory.status,
    };
  }
}
