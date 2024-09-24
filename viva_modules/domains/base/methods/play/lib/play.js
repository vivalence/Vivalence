export async function handlePlay({ scope, nextPlay, response }, ctx) {
  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };

  const play = await findPlay({ scope }, ctx);

  if (!play) {
    return await createPlay({ scope, nextPlay, response }, ctx);
  } else {
    return await updatePlay({ play, nextPlay, response }, ctx);
  }
}

export async function findPlay({ scope }, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Play")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("memoryId", scope.memory.id)
    .eq("tacticId", scope.tactic.id)
    .eq("gameId", scope.game.id)
    .eq("userId", scope.user.id);

  if (scope.unit) query = query.eq("unitId", scope.unit.id);
  else query = query.filter("unitId", "is", null);

  if (scope.tag) query = query.eq("tagId", scope.tag.id);
  else query = query.filter("tagId", "is", null);

  let { data: plays, error } = await query.limit(1);

  if (error) throw error;
  return plays[0];
}

export async function createPlay({ scope, response, nextPlay }, ctx) {
  const now = new Date().toISOString();

  const { data: updatedPlay, error: createError } = await ctx.runtime.locals.supabase
    .from("Play")
    .insert([
      {
        runtimeId: ctx.runtime.manifest.id,
        userId: scope.user.id,
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
}

export async function updatePlay({ play, nextPlay, response }, ctx) {
  const now = new Date().toISOString();
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
