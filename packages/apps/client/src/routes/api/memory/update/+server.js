import { json } from "@sveltejs/kit";
import { getDateTimeInXHours, getTimeDifferenceFromNow } from "$lib/time";
import * as ebisu from "$lib/ebisu";

// { gameId, gameType, unitId, response }
export async function POST({ locals: { supabase, getSession }, request, ...props }) {
  try {
    const { gameType, gameId, tagId, unitId, response } = await request.json();
    const { user } = await getSession();

    let memory, nextPlay;

    let query = supabase
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

      const { data: createdMemory, error } = await supabase
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
      return json({
        data: {
          memory: createdMemory,
          nextPlay,
        },
        error: null,
      });
    } else {
      const now = new Date().toISOString();
      const elapsedTime = getTimeDifferenceFromNow(memory.lastSeen);
      const model = ebisu.updateModel(memory.state, response, elapsedTime);
      const nextReviewIn = ebisu.predictNextReviewTime(model);
      const nextPlay = getDateTimeInXHours(nextReviewIn);

      const history = [...memory.history, { gameType, response, model, nextPlay, date: now }];
      const status = getStatus(nextReviewIn, history);
      // console.log("memory", unitId, response, status, nextPlay, nextReviewIn);

      const { data: updatedMemory, error } = await supabase
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
      return json({
        data: {
          memory: updatedMemory,
          nextReviewIn,
          nextPlay,
          memoryStatusChange: status !== memory.status,
        },
        status: 200,
      });
    }
  } catch (err) {
    console.error(`[MEMORY ERROR /api/memory]`, err.message);
    console.error(err);
    return json({ error: err, status: 500 });
  }
}

const getStatus = (nextReviewIn, history) => {
  const checkLastResponses = (n, condition) => {
    const recentResponses = history.slice(-n).map((entry) => entry.response);
    return recentResponses.every((response) => condition.includes(response));
  };

  const isUnknown = nextReviewIn < 1 || checkLastResponses(3, ["UNKNOWN"]);
  const isLearning = nextReviewIn >= 1;
  const isKnown = nextReviewIn > 24 * 7 && checkLastResponses(3, ["KNOWN", "GRADUATE"]);
  const isGraduated = nextReviewIn > 24 * 14 && checkLastResponses(5, ["KNOWN", "GRADUATE"]);

  // @lj dont change order
  if (isUnknown) {
    return "UNKNOWN";
  } else if (isGraduated) {
    return "GRADUATED";
  } else if (isKnown) {
    return "KNOWN";
  } else if (isLearning) {
    return "LEARNING";
  }

  return "UNKNOWN";
};

// // // Example usage
// const history = [
//     { response: "KNOWN", date: new Date() },
//     { response: "GRADUATED", date: new Date() },
//     { response: "KNOWN", date: new Date() }
// ];

// console.log("hi", getStatus(751.8439344719621, history));
