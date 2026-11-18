import { mime, Vector } from "@vivalence/typology";
import { gestalten } from "@vivalence/runtime";
import { doctor, doors, persona, research, web } from "./tools/index.js";
import { harness as voice } from "./harness.js";
import { drawing } from "./page/index.js";
export { primer } from "./harness.js";

export const manifest = {
  type: "demo",
  slug: "hello-world",
  traits: [
    "HARNESS",      // mode has access to the daemon's harness
    "CONVERSATION", // mode can be chatted with
    "GENERATIVE",     // buffers hallucinated at runtime
    "TOOLING",         // mode provides agentic tools
    "PRIMER",

    "EMITTER",        // mode renders ad-hoc buffers
    "VIEWABLE",       // buffers from static svelte

    "EXPOSED",        // mode serves http endpoints
  ],
};

export const tools = new Vector()
  .graft(doctor)
  .graft(web)
  .graft(research)
  .graft(gestalten.tools.entity, gestalten.tools.buffer, gestalten.tools.thread, gestalten.tools.mode)
  .graft(drawing);

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
export { emitter } from "./page/index.js";
