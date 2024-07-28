export default async function (body, ctx) {
  const session = await ctx.runtime.locals.getSession();
  await ctx.runtime.call("/unit/validate", body.unit);

  const { gameId, unitId, tagId, memoryId, nextPlay, response } = body;
  const { user } = session;
  const now = new Date().toISOString();

  let play;
  let query = runtime.locals.supabase
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
    const { data: updatedPlay, error: createError } = await runtime.locals.supabase
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
          history: [{ response, nextPlay, now }],
        },
      ])
      .single()
      .select("id, nextPlay");

    if (createError) throw createError;

    return {
      data: { play: updatedPlay },
      status: 200,
    };
  } else {
    const updatedHistory = [...play.history, { response, nextPlay, now }];

    const { data: updatedPlay, error: updateError } = await runtime.locals.supabase
      .from("Play")
      .update({
        history: updatedHistory,
        nextPlay,
        lastPlay: now,
        updatedAt: now,
      })
      .eq("id", play.id)
      .select("id, nextPlay")
      .single();

    if (updateError) throw updateError;

    return { play: updatedPlay };
  }
}
