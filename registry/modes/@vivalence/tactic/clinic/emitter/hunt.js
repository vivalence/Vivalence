import { shuffle } from "./tools.js";
// ── sub-emitter: hunt ──────────────────────────────────────────────
// target stragglers: write + judge-FAST. no hand-holding.
// input: { items, distractors? }

export default async (ctx) => {
  const { items, distractors } = ctx.input;
  if (!items?.length) return;

  const game = ctx.daemon.modes.game;
  const isParadigm = items[0]?.paradigm != null;
  const forms = isParadigm ? items.flatMap((d) => d.forms) : items;
  const pool = distractors?.[0]?.paradigm
    ? distractors.flatMap((d) => d.forms)
    : distractors ?? forms;

  const writeItems = shuffle(forms).slice(0, 2);
  ctx.pool
    .section(...writeItems.map((literal) => game.write.emit.literals({ literal, recall: "LEARNING" })))
    .apply(shuffle);

  ctx.pool
    .section(
      ...shuffle(forms).slice(0, 2).map((literal) =>
        game.judge.emit.literal({
          literal,
          distractors: pool.filter((f) => f.id !== literal.id),
          speed: { rate: "FAST" },
        }),
      ),
    )
    .apply(shuffle);
};
