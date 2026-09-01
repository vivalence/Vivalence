import { App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "playground",
  slug: "dealer",
  name: "Dealer",
  description: "Driver hub: deals card buffers, drives the thread phase, talks.",
  version: "0.1.0",
  traits: ["APPLICATION", "STANDALONE", "EMITTER", "HARNESSED", "CONVERSATIONAL"],
};

// the hub is a control surface — its buffer carries nothing.
export const app = new App("buffer/Dealer.svelte", v.buffer({ data: {} }));

// the finite deck the dealer deals from. running off the end = EXHAUSTED.
const DECK = ["A♠", "K♥", "Q♦", "J♣", "10♠", "9♥", "8♦", "7♣"];

// ── harness · the dealer's persona — powers /oracle AND the conversation ─────────
export const harness = new Vector();
harness.use(async (ctx, next) => {
  ctx.hallucination.system.dealer = [
    "You are the Dealer in a card-game playground inside vivalence.",
    "You deal cards (render buffers) onto the table (the moat) for the player.",
    "Keep replies short and plain — two or three sentences, no markdown.",
  ].join("\n");
  await next();
});

// ── emitter · two ways to deal, both yielding `card` buffers (cross-mode) ─────────
export const emitter = new Vector()
  // deterministic: deal the next N off the finite deck. thread.counter = how many already
  // dealt, so the deck empties → Pool drains EXHAUSTED → continuous stops cleanly.
  .open(
    { nature: "/deal", input: v.object({ count: v.integer({ minimum: 1 }).default(2) }) },
    async (ctx) => {
      const card = ctx.daemon.modes.playground.card;
      const start = ctx.thread?.counter ?? 0;
      for (const face of DECK.slice(start, start + ctx.input.count))
        ctx.pool.add(card.buffer({ data: { face } }));
    },
  )
  // agentic: the dealer picks a themed hand via its harness (mirrors aprende /coach).
  .open(
    {
      nature: "/oracle",
      input: v.object({
        count: v.integer({ minimum: 1 }).default(3),
        focus: v.string().optional(),
        thread: v.string().optional(),
      }),
    },
    async (ctx) => {
      const card = ctx.daemon.modes.playground.card;
      const context = [
        `Pick ${ctx.input.count} cards for a themed hand from this deck: ${DECK.join(" ")}.`,
        ctx.input.focus ? `Theme: ${ctx.input.focus}.` : null,
        "Return the faces only, exactly as written in the deck.",
      ]
        .filter(Boolean)
        .join("\n");
      const { output } = await ctx.mode.harness.object.render({
        turns: [
          { role: "system", parts: [{ type: "text", text: context }] },
          { role: "user", parts: [{ type: "text", text: "Deal the hand." }] },
        ],
        output: v.object({ faces: v.array(v.string()) }),
        tune: "frugal",
      });
      for (const face of (output.object?.faces ?? []).filter((f) => DECK.includes(f)))
        ctx.pool.add(card.buffer({ data: { face } }));
    },
  );

// ── dataset · a fully-declarative thread: AIMED at /deal, queued, continuous on open ──
// intent.phase (M4.1) means opening this intent auto-engages continuous — no hub click.
export const dataset = {
  intent: [
    {
      slug: "table",
      name: "Open table",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: { AIMED: { mount: "/emit/deal" }, MASKED: {}, QUEUEING: { depth: 3 } },
      phase: "continuous",
    },
  ],
};
