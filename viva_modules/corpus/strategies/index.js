async function boot(runtime) {
  runtime.bus.on("@domain:user-join", async (ctx) => {
    console.log("@CORPUS event handler on: @domain:user-join");

    await ctx.runtime.call("/install/strategy", {
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
            },
            for: { type: "repetitions", value: 10 },
          },
        ],
      },
    });
  });
  runtime.bus.on("@domain:graduation", async (event, runtime) => {
    console.log("@CORPUS event handler on: @domain:graducation");
    if (!event.body.tag.slug === "a1 dependency slug") {
      await ctx.runtime.call("/install/strategy", {
        user: { id: ctx.event.body.user.id },
        strategy: {
          name: "A2 Spanish - Beginner",
          session: [
            {
              tactic: {
                slug: "morphology-of-gender-and-number",
                relations: {
                  tags: {
                    structural: { slug: "structural:a2" },
                  },
                },
              },
              for: { type: "repetitions", value: 10 },
            },
          ],
        },
      });
    }
  });
  return runtime;
}

export default {
  boot,
};
