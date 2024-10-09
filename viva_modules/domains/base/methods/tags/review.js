export default async function (body, ctx) {
  const { scope, gameType, response } = body;

  const { data: tag, error: te } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select("id,traits,data")
    .eq("id", scope.tag.id)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();

  if (te) throw te;
  if (!tag) throw new Error("Tag not found");
  if (!tag.traits.includes("LEARNABLE")) {
    // maybe i should just ignore and return null;
    throw new Error("Tag is not learnable");
  }

  if (tag.data["LEARNABLE"].flavor === "INDIVIDUAL") {
    delete scope.unit;
  } else if (tag.data["LEARNABLE"].flavor === "RELATIONAL") {
    if (!scope.unit || !scope.unit.id)
      throw new Error("Unit is required for relational learnable tags");
  } else {
    throw new Error("Invalid learnable tag flavor");
  }

  const {
    memory,
    nextPlay,
    error: me,
    ...memoryData
  } = await ctx.runtime.call("/memory/update/tag", {
    scope,
    gameType,
    response,
  });

  if (me) throw me;

  scope.memory = { id: memory.id };

  const playData = await ctx.runtime.call("/play/update/tag", {
    scope,
    nextPlay,
    response,
  });

  return { ...playData, ...memoryData, memory, nextPlay };
}
