import { Vector, v } from "@vivalence/typology";
import { gather } from "./dossier.js";

export const manifest = {
  type: "teacher",
  slug: "dewey",
  name: "Dewey",
  description: "Brazilian Portuguese conversation tutor.",
  traits: ["EXPOSED", "SELFEVIDENT", "TOOLED", "CHAOSMONKEY", "CONVERSATIONAL"],
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
  ctx.hallucination.add(dossier.toPrompt());
  await next();
});

harness.branch("/voice").use(async (ctx, next) => {
  // DO SOME SHIT TO
  // ctx.hallucination
  // to customize voice generation....
  await next();
});

export const tools = new Vector();

tools.open(
  {
    nature: "/learner/state",
    valence:
      "Read the learner's overall progress histogram, weakest items, recent reviews, due items, and recent mistakes. Use to ground responses in what the learner is actually working on.",
    input: v.object({}),
    output: v.object({
      histogram: v.record(v.string(), v.integer()),
      weak: v.array(v.unknown()),
      recent: v.array(v.unknown()),
      due: v.array(v.unknown()),
      mistakes: v.array(v.unknown()),
    }),
  },
  async (ctx) => (await gather(ctx)).toJSON(),
);
