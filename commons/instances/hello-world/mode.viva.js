import { mime, Vector } from "@vivalence/typology";
import { doctor, doors, persona, research, web } from "./tools/index.js";
import { harness as voice } from "./harness.js";
export { primer } from "./harness.js";

export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: [
    "HARNESSED",      // mode has access to the daemon's harness
    "CONVERSATIONAL", // mode can be chatted with
    "TOOLING",         // mode provides agentic tools
    "PRIMER",

    "EMITTER",        // mode renders ad-hoc buffers
    "VIEWABLE",       // buffers from static svelte
    "GENERATIVE",     // buffers hallucinated at runtime

    "EXPOSED",        // mode serves http endpoints
  ],
};

export const tools = new Vector()
  .graft(doctor)
  .graft(web)
  .graft(research);

export const views = [{ slug: "hello-world", mount: "app/App.svelte", mime: mime.dom.svelte }];

export const aperture = new Vector()
  .use(async (ctx, next) => {
    console.log(ctx.user.id, "calling", ctx.mode.manifest.slug);
    await next();
  })
  .open("/hello/bot", () => ({ greeting: "Bot says high." }))
  .open("/hello/agent", persona)
  .graft(doors);

export const harness = new Vector()
  .graft(voice);
export { emitter, generator } from "./page/index.js";
