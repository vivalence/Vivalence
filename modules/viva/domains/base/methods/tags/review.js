export default async function (body, ctx) {
  const { scope, signal } = body;

  const { data: tag, error: te } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select("id, traits, data")
    .eq("id", scope.tag.id)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();

  if (te || !tag) throw te || new Error("Tag not found");

  if (!tag.traits.includes("LEARNABLE")) {
    throw new Error("Tag is not learnable");
  }

  if (tag.data["LEARNABLE"].flavor === "INDIVIDUAL") {
    delete scope.unit;
  } else if (tag.data["LEARNABLE"].flavor === "RELATIONAL") {
    if (!scope.unit.id) throw new Error("Unit required for relational learnable tags");
  } else {
    throw new Error("Invalid learnable tag flavor");
  }

  const { statusChange, ...memory } = await ctx.runtime.call("/memory/update", { scope, signal });

  if (statusChange)
    (async () => {
      const event = { tag, memory, scope };
      const handled = await ctx.runtime.bus.emit("tag:memorystatuschange", event);
      console.log("handled unit memory status update", event, handled);
    })();

  scope.memory = { id: memory.id };

  const play = await ctx.runtime.call("/play/update", {
    nextIn: memory.nextIn,
    nextAt: memory.nextAt,
    lastAt: memory.lastAt,
    scope,
    signal,
  });

  return { memory, play, statusChange };
}
