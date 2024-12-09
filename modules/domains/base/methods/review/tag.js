export default async function (body, ctx) {
  const { scope, signal } = body;

  const { data: tag, error: te } = await ctx.runtime.services.supabase
    .from("Tag")
    .select("id, traits, data")
    .eq("id", scope.tag.id)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();

  if (te || !tag) throw te || new Error("Tag not found");

  if (!tag.traits.includes("LEARNABLE")) {
    return { status: "bounce", message: "Invalid learnable tag flavor" };
  }
  if (tag.data["LEARNABLE"].flavor === "INDIVIDUAL") {
    delete scope.unit;
  } else if (tag.data["LEARNABLE"].flavor === "RELATIONAL") {
    if (!scope.unit?.id) {
      return { status: "bounce", message: "Unit required for relational learnable tags" };
    }
  } else {
    return { status: "bounce", message: "Invalid learnable tag flavor" };
  }

  const { statusChange, ...memory } = await ctx.runtime.call("/review/memory", { scope, signal });

  if (statusChange)
    (async () => await ctx.runtime.bus.emit("MemoryStatusChange:Tag", { tag, memory, scope }))();

  scope.memory = { id: memory.id };

  const play = await ctx.runtime.call("/review/play", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return { status: "success", memory, play, statusChange };
}
