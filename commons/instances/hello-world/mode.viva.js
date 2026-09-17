import { App, Vector, shard } from "@vivalence/typology";
import { doctor, doors, persona, research, web } from "./tools/index.js";
import { harness as voice } from "./harness.js";

export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: [
    "HARNESSED",      // mode has access to the daemon's harness
    "CONVERSATIONAL", // mode can be chatted with
    "TOOLING",         // mode provides agentic tools

    "EMITTER",        // mode renders ad-hoc buffers
    "APPLICATION",    // buffers from static svelte
    "GENERATIVE",     // buffers hallucinated at runtime

    "EXPOSED",        // mode serves http endpoints
    "STANDALONE",     // mode is an entrypoint on the client
  ],
};

export const tools = new Vector()
  .slurp(doctor)
  .slurp(web)
  .slurp(research);

export const application = new App("./app/App.svelte");

export const aperture = new Vector()
  .use(async (ctx, next) => {
    console.log(ctx.user.id, "calling", ctx.mode.manifest.slug);
    await next();
  })
  .open("/hello/bot", () => ({ greeting: "Bot says high." }))
  .open("/hello/agent", persona)
  .slurp(doors);

export const harness = new Vector()
  .use(shard.hal.defaults({ policy: { tune: "capable", rounds: 10 }, settings: { effort: "low" } }))
  .slurp(voice);
export { emitter, generator } from "./page/index.js";
