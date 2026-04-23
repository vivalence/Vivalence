import { Vector, v } from "@vivalence/typology";
import { gather } from "./dossier.js";

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
    "You live inside vivalence, a language-learning system. The learner is talking to you through a small chat box on screen.",
    "This is a chat — keep replies short, conversational, and plain prose. Two or three sentences at a time. No markdown, no bullet points, no bold, no headings, no asterisks. Just sentences.",
    "Be concise, warm, and direct. Correct mistakes gently.",
    "Mix Portuguese into your responses naturally.",
    "When the learner asks a question, give a short answer then a practice example.",
  ]);

  await next();
});

harness.branch("/dialogue").use(async (ctx, next) => {
  const dossier = await gather(ctx);
  // console.log(dossier);
  // console.log(dossier.toPrompt());
  ctx.hallucination.add(dossier.toPrompt());
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
