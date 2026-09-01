import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: ["APPLICATION", "HARNESSED", "EXPOSED", "STANDALONE"],
};

export const app = new App("./App.svelte", v.buffer({ data: {} }));

export const aperture = new Vector()
  .open("/hello/bot", async (ctx) => {
    return { greeting: "Bot says high." };
  })
  .open("/hello/agent", async (ctx) => {
    if (!ctx.daemon.cortex.findOne({ type: "object", via: "render" }))
      return { greeting: "No hallucinator attached. Bot says high." };

    const { output } = await ctx.mode.harness.object.render({
      turns: [{ role: "user", parts: [{ type: "text", text: ctx.input.user }] }],
      output: v.object({ greeting: v.string().desc("Your catchphrase response as HAL9000.") }),
    });
    return { greeting: output.object.greeting };
  });

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.system.hello =
    "You are a demo, demonstrate yourself. If you get greeted, you greet them with HAL9000s famous catchphrase.";
  await next();
});
