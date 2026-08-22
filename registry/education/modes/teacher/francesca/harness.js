import { Vector, v } from "@vivalence/typology";
import francesca from "./francesca.md" with { type: "text" };

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.policy.tune ??= "fast";
  ctx.hallucination.system.francesca = francesca;
  await next();
});

harness.branch("/dialogue").use(async (ctx, next) => {
  await next();
  if (!ctx.output?.[Symbol.asyncIterator]) return;
  const source = ctx.output;
  const within = ctx.daemon.datamap.shard.carry();
  ctx.output = (async function* () {
    try {
      yield* source;
    } finally {
      within(() => appraise(ctx)).catch((fault) => console.error("[francesca/appraise]", fault));
    }
  })();
});

async function appraise(ctx) {
  await new Promise((settle) => setTimeout(settle, 1000));
  const SIGNAL = ctx.daemon.domain.SIGNAL;
  const turns = (
    await ctx.daemon.entities.turn.find(
      { thread: ctx.input.thread },
      { orderBy: { createdAt: "DESC" }, limit: 10 },
    )
  ).reverse();
  const ROUNDS = ["review", "language-learning_review", "appraise"];
  const sealed = turns.findLast((turn) => turn.role === "assistant");
  const appraised = (turn) =>
    turn.parts.some((part) => part.type === "tool_use" && ROUNDS.includes(part.name));
  if (!sealed || sealed.meta?.appraise || appraised(sealed)) return;
  const previous = turns.filter((turn) => turn.role === "assistant" && turn !== sealed).slice(-4);
  const prior = new Set(
    previous
      .flatMap((turn) => turn.parts)
      .filter((part) => part.type === "tool_use" && ROUNDS.includes(part.name))
      .flatMap((part) => part.input?.reviews?.map((review) => review.literal) ?? []),
  );
  const render = await ctx.mode.harness.object.render({
    turns: [
      ...turns,
      {
        role: "user",
        parts: [
          {
            type: "text",
            text: `You are the reviewer riding this tutoring session. The recent conversation is above, including earlier review calls. Appraise the LATEST exchange only — everything before it is context for judging arcs, slugs and prior coverage. Think first, then review; the output field descriptions carry the rules.${
              prior.size
                ? ` Already reviewed in the recent exchanges, and dropped if repeated: ${[...prior].join(", ")}.`
                : ""
            }`,
          },
        ],
      },
    ],
    output: v
      .object({
        thinking: v
          .string()
          .desc(
            "Work through before deciding: what did the learner actually exercise in the LATEST exchange and how did each rep go? For a composite rep, which component's knowledge caused the miss — the surface slot where the error shows, or the item behind it? What is still mid-drill and should be withheld until it settles? What did an earlier review call already cover? Was this exchange meta-talk with nothing to review?",
          ),
        reviews: v
          .array(
            v.object({
              literal: v
                .string()
                .desc(
                  "The literal's slug, exactly as a read tool reported it in this conversation (essere, avere.present.indicative). Never invent, translate, or inflect a slug.",
                ),
              signal: v
                .enum(SIGNAL)
                .desc(
                  "MASTERY — instant and effortless, no hesitation or hints · SUCCESS — correct, even if slow or self-corrected · NEUTRAL — shown or told without being tested, or skipped · MISTAKE — wrong but close (right family, wrong ending) · FAILURE — blank, wrong, or needed the answer. Negative signals are the system working: a MISTAKE or FAILURE reschedules the item sooner, which is exactly what the learner needs — never soften a real miss. Milder-when-torn covers factual uncertainty about what happened, not kindness.",
                ),
            }),
            { maxItems: 10 },
          )
          .desc(
            "One entry per item the learner completed a rep of in the LATEST exchange — produced it, failed it, or got corrected on it. Composite reps (article+noun, verb+person, contraction) score PER ITEM by where the fault lies: the item whose knowledge CAUSED the miss takes the negative signal, not the slot where the error surfaced — 'un studente' for 'uno studente' is an article-slot error, but the cause is the learner's model of studente's article class, so studente.noun takes the MISTAKE; a component the learner genuinely produced right takes its own positive signal; a component merely given by the prompt is not reviewed. WITHHOLD items still mid-arc (rotation running, correction awaiting its retry); they get appraised on a later exchange. Never repeat an item an earlier review call covered unless this exchange exercised it again. Empty when the exchange was meta-talk or everything is still in flight.",
          ),
      })
      .desc(
        "The appraisal of the latest exchange. Every entry becomes a spaced-repetition review that reschedules the item — an over-report inflates the learner's record, an under-report loses a rep.",
      ),
  });
  const reviews = (render.output?.object?.reviews ?? []).filter(
    (review, index, all) =>
      !prior.has(review.literal) &&
      all.findIndex((other) => other.literal === review.literal) === index,
  );
  if (!reviews.length) return;
  const lines = [];
  const retentions = [];
  for (const review of reviews) {
    try {
      const retention = await ctx.daemon.call["/review/literal"]({
        user: ctx.user,
        mode: ctx.mode,
        thread: { id: ctx.input.thread },
        input: review,
      });
      lines.push(
        `${review.literal} ${review.signal} → ${retention.status}, next ${
          retention.nextAt?.toISOString().slice(0, 10) ?? "—"
        }`,
      );
      retentions.push(retention);
    } catch (fault) {
      console.error("[francesca/appraise]", review.literal, fault.message);
      lines.push(`${review.literal} ${review.signal} → error: ${fault.message}`);
    }
  }
  const id = crypto.randomUUID();
  sealed.parts = [
    ...sealed.parts,
    { type: "tool_use", id, name: "language-learning_review", input: { reviews } },
    {
      type: "tool_result",
      id,
      output: { message: lines.join("\n"), entities: { retention: retentions } },
    },
  ];
  await ctx.daemon.entities.em.flush();
}
