export default async function (body, ctx) {
  console.log("REVIEW the tag.review() function - scope updates indescriminately", body.scope);

  const { scope, gameType, response } = body;

  const { memory, nextPlay, error, ...memoryData } = await ctx.runtime.call("/memory/update", {
    scope,
    gameType,
    response,
  });

  if (error) throw error;

  scope.memory = { id: memory.id };

  const playData = await ctx.runtime.call("/play/update", {
    scope,
    nextPlay,
    response,
  });

  const { data: tag } = await runtime.locals.supabase
    .from("Tag")
    .select("id, data, name, slug, traits")
    .eq("id", tagId)
    .single();

  return { ...tag, ...playData, ...memoryData, memory, nextPlay };
}
