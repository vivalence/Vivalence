import { json } from "@sveltejs/kit";

export async function POST({ fetch, locals: { supabase, client }, request }) {
  try {
    const { gameId, gameType, tagId, unitId, response } = await request.json();

    const memoryData = await client("memory/update", {
      gameId,
      gameType,
      unitId,
      tagId,
      response,
    }).ok();

    const playData = await client("play/update", {
      gameId,
      memoryId: memoryData.memory.id,
      nextPlay: memoryData.nextPlay,
      unitId,
      tagId,
      response,
    }).ok();

    const { data: tag } = await supabase.from("Tag").select("data").eq("id", tagId).single();

    return json({
      data: { ...tag, ...playData, ...memoryData },
      status: 200,
    });
  } catch (err) {
    console.error(`[ERROR] /api/tags POST:\n`, err.message);
    console.error(err);
    console.error(params);
    return json({ status: 500, error: err });
  }
}
