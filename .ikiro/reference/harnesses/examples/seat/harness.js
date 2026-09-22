import { shard, v, Vector } from "@vivalence/typology";

export const ANSWER = v.object({
  uci: v.string().desc('One move as UCI, taken from the legal list. Example: "g1f3"'),
  comment: v.string().desc('One sentence for the operator. Example: "Developing with tempo."'),
});

const SEAT = [
  "You are seated at a chess board and it is your move.",
  "Answer with exactly one move from the legal list, as UCI.",
  "The comment is one plain sentence for the operator watching.",
].join("\n");

const ATTEMPTS = 2;

const uciOf = (folded) => String(folded?.output?.object?.uci ?? "").trim();

const amended = (turns, tried, legal) => {
  const last = turns.at(-1);
  const fault = {
    type: "text",
    text: `Rejected, not legal in this position: ${tried.join(", ")}. Legal moves: ${legal.join(" ")}. Answer with one of them.`,
  };
  return [...turns.slice(0, -1), { ...last, parts: [...last.parts, fault] }];
};

export const harness = new Vector()
  .use(shard.hal.defaults({ policy: { tune: "capable", rounds: 1 }, settings: { effort: "low" } }))
  .use(async (ctx, next) => {
    ctx.hallucination.system.seat = SEAT;
    await next();
  });

harness.branch("/object").use(async (ctx, next) => {
  await next();
  const legal = ctx.input.legal;
  if (!legal) return;
  const tried = [];
  while (!legal.includes(uciOf(ctx.output))) {
    tried.push(uciOf(ctx.output) || "(empty)");
    if (tried.length > ATTEMPTS) throw new Error(`[seat] no legal move after ${tried.length} answers: ${tried.join(", ")}`);
    ctx.output = await ctx.daemon.cortex.hallucinate.object.render({
      ...ctx.hallucination,
      controller: ctx.hallucination.controller.branch(`repair-${tried.length}`),
      turns: amended(ctx.hallucination.turns, tried, legal),
    });
  }
});
