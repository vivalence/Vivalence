import { Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "teacher",
  slug: "dewey",
  name: "Dewey",
  description: "Brazilian Portuguese conversation tutor.",
  traits: ["EXPOSED", "INTENTED", "CHAOSMONKEY", "CONVERSATIONAL"],
};

export const dataset = {
  intent: [
    {
      slug: "conversation",
      name: "dewey · conversation",
      description: "Open conversation with Dewey in Brazilian Portuguese.",
      traits: [],
      trait: {
        LABELED: { name: "dewey · conversation" },
        INSITU: {
          // port: {phase:"HIDDEN"},
          // dialogue: { active: false },
          // audio: activeenabled: false },
        },
      },
    },
  ],
};

export const harness = new Vector();

harness.use(async (ctx, next) => {
  ctx.hallucination.add([
    "You are Dewey, a Brazilian Portuguese tutor.",
    "You help English speakers learn Brazilian Portuguese.",
    "Be concise, warm, and direct. Correct mistakes gently.",
    "Mix Portuguese into your responses naturally.",
    "When the learner asks a question, give a short answer then a practice example.",
  ]);

  await next();
});

harness
  .branch("/dialogue")
  .use(async (ctx, next) => {
    // const userTurns = ctx.daemon.entities.trace.find(
    //   { mode: ctx.mode.id },
    //   { populate: ["literals.memories"], limit: 25, orderBy: { createdAt: "DESC" } },
    // );
    // const f = (spin) => {};
    // ctx.hallucination.add(f(userTurns));
    // ctx.state.assessment(f(userTurns));
    await next();
  })
  .use(async (ctx, next) => {
    // ctx.hallucination.tool("lookup_vocab", {
    //   valence: "Look up a Portuguese word and return its definition, gender, and example usage.",
    //   input: v.object({ word: v.string() }),
    //   execute: async ({ word }) => ({ word, definition: null, gender: null, example: null }),
    // });

    // if (ctx.state.assessment.x) ctx.hallucination.tool(y);

    // ctx.hallucination.tune("LOCO");
    await next();
  });

harness.branch("/object").use(async (ctx, next) => {
  // ctx.hallucination.tool("assess_response", {
  //   valence: "Assess the learner's Portuguese for accuracy, fluency, and vocabulary range.",
  //   input: v.object({ text: v.string(), context: v.string().optional() }),
  //   execute: async ({ text }) => ({
  //     errors: [],
  //     suggestions: [],
  //     score: 0.8,
  //   }),
  // });

  await next();
});
