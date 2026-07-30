import { Vector, v, App } from "@vivalence/typology";
import francesca from "./francesca.md" with { type: "text" };
import state from "./state.md" with { type: "text" };

export const manifest = {
  type: "teacher",
  slug: "francesca",
  name: "Francesca",
  description: "Italian conversation tutor.",
  traits: ["CONVERSATIONAL", "HARNESSED"],
};

export const harness = new Vector()
  .use(async (ctx, next) => {
    ctx.hallucination.configure({ tune: "fast" }).context.system(francesca, state);
    await next();
  }).root;

// export const harness = new Vector(); harness.use(async (ctx, next) => {ctx.hallucination.add([``]); await next();});
// harness.branch("/dialogue").use(async (ctx, next) => {const report = await gather(ctx); ctx.hallucination.add(report.toPrompt()); await next();});
// export const tools = new Vector(); tools.open({nature: "/learner/state", valence: "Read the learner's overall progress histogram, weakest items, recent reviews, due items, and recent mistakes. Use to ground responses in what the learner is actually working on.", input: v.object({}), output: v.object({histogram: v.record(v.string(), v.integer()), weak: v.array(v.unknown()), recent: v.array(v.unknown()), due: v.array(v.unknown()), mistakes: v.array(v.unknown()),}),}, async (ctx) => (await gather(ctx)).toJSON(),);
