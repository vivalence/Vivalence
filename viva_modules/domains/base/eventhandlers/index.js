function boot(runtime) {
  runtime.bus.on("unit:memorystatuschange", async (input, ctx) => {
    const { data: relations } = await ctx.runtime.locals.supabase
      .from("_TagToUnit")
      .select("*")
      .eq("B", input.unit.id);

    const { data: completables } = await ctx.runtime.locals.supabase
      .from("Tag")
      .select("id,runtimeId,traits")
      .eq("runtimeId", ctx.runtime.manifest.id)
      .in(
        "id",
        relations.map((r) => r.A),
      )
      .contains("traits", ["COMPLETABLE"]);

    return await Promise.all(
      completables.map((tag) => ctx.runtime.call("/tags/completable", { tag })),
    );
  });
}

export default { boot };
