async function boot(runtime) {
  runtime.bus.on("@domain:user-join", async (ctx) => {
    console.log("@CORPUS event handler on: @domain:user-join");

    const strategy = await ctx.runtime.call("/install/strategy", {
      user: { id: ctx.event.body.user.id },
      strategy: {
        name: "A1 Spanish - Beginner",
        session: [
          {
            tactic: {
              slug: "morphology-of-gender-and-number",
              relations: {
                tags: {
                  structural: { slug: "structural:a1" },
                },
              },
              masks: {},
            },
            for: { type: "repetitions", value: 10 },
          },
        ],
      },
    });

    const { data: user } = await ctx.runtime.locals.supabase
      .from("AppUser")
      .select("id, config")
      .eq("id", ctx.event.body.user.id)
      .single();

    const config = {
      ...user.config,
      defaults: {
        runtime: { id: ctx.runtime.manifest.id, strategy: { id: strategy.id } },
      },
    };

    const { data } = await ctx.runtime.locals.supabase
      .from("AppUser")
      .update({ config })
      .eq("id", body.user.id)
      .select("*")
      .single();
  });

}

export default {
  boot,
};
