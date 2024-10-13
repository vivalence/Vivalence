export default async function ({ scope, lastAt, nextAt, nextIn, signal }, ctx) {
  if (!scope.user) {
    const user = await ctx.runtime.locals.getUser();
    if (!user) throw new Error("User not found");
    scope.user = { id: user.id };
  }

  const play = await read({ scope }, ctx);

  if (!play) {
    return await create({ scope, lastAt, nextIn, nextAt, signal }, ctx);
  } else {
    return await update({ play, lastAt, nextIn, nextAt, signal, scope }, ctx);
  }
}

export async function read({ scope }, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Play")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("memoryId", scope.memory.id)
    .eq("gameId", scope.game.id)
    .eq("userId", scope.user.id);

  if (scope.tactic) query = query.eq("tacticId", scope.tactic.id);
  else query = query.filter("tacticId", "is", null);

  if (scope.unit) query = query.eq("unitId", scope.unit.id);
  else query = query.filter("unitId", "is", null);

  if (scope.tag) query = query.eq("tagId", scope.tag.id);
  else query = query.filter("tagId", "is", null);

  let { data: play, error } = await query.limit(1).maybeSingle();

  if (error) throw error;
  return play;
}

export async function create({ scope, lastAt, nextIn, nextAt, signal }, ctx) {
  const history = [{ signal, nextIn, nextAt, lastAt, scope }];
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Play")
    .insert([
      {
        runtimeId: ctx.runtime.manifest.id,
        userId: scope.user.id,
        memoryId: scope.memory.id,
        gameId: scope.game.id,
        tacticId: scope.tactic?.id,
        unitId: scope.unit?.id,
        tagId: scope.tag?.id,
        nextAt,
        nextIn,
        lastAt,
        history,
      },
    ])
    .single()
    .select("id");

  if (error) throw error;

  return { id: data.id, nextIn, nextAt, lastAt, history };
}

export async function update({ play, lastAt, nextIn, nextAt, signal, scope }, ctx) {
  const history = [...play.history, { signal, nextIn, nextAt, lastAt, scope }];
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Play")
    .update({
      history,
      nextAt,
      nextIn,
      lastAt,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", play.id);

  if (error) throw error;

  return { id: play.id, nextIn, nextAt, lastAt, history };
}
