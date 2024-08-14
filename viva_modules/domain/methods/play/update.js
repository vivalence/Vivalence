export default async function (body, ctx) {
  const user = await ctx.runtime.locals.getUser();
  const { scope, nextPlay, response } = body;
  const now = new Date().toISOString();
  scope.user = { id: user.id };

  let play;
  let query = ctx.runtime.locals.supabase
    .from("Play")
    .select("*")
    .eq("memoryId", scope.memory.id)
    .eq("tacticId", scope.tactic.id)
    .eq("gameId", scope.game.id)
    .eq("userId", user.id);

  if (scope.unit) query = query.eq("unitId", scope.unit.id);
  else query = query.filter("unitId", "is", null);

  if (scope.tag) query = query.eq("tagId", scope.tag.id);
  else query = query.filter("tagId", "is", null);

  let { data: plays, error } = await query.limit(1);
  if (error) throw error;
  play = plays[0];

  if (!play) {
    const { data: updatedPlay, error: createError } = await ctx.runtime.locals.supabase
      .from("Play")
      .insert([
        {
          userId: user.id,
          gameId: scope.game.id,
          tacticId: scope.tactic.id,
          unitId: scope.unit?.id,
          tagId: scope.tag?.id,
          memoryId: scope.memory.id,
          nextPlay,
          lastPlay: now,
          history: [{ response, nextPlay, now }],
        },
      ])
      .single()
      .select("id, nextPlay");

    if (createError) throw createError;

    return {
      play: updatedPlay,
    };
  } else {
    const updatedHistory = [...play.history, { response, nextPlay, now }];

    const { data: updatedPlay, error: updateError } = await ctx.runtime.locals.supabase
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
