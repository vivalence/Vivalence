import { shuffle } from "./tools.js";
// ── sub-emitter: introduce ─────────────────────────────────────────
// exhibit new material + (paradigm mode | flashcard)
// input: { items, title?, subtitle?, layout?, exhibit? }
// exhibit defaults true but callers can suppress for re-familiarization

export default async (ctx) => {
  const { items, title, subtitle, layout, exhibit = true } = ctx.input;
  if (!items?.length) return;

  const game = ctx.daemon.modes.game;
  const isParadigm = items[0]?.paradigm != null;
  const forms = isParadigm ? items.flatMap((d) => d.forms) : items;

  if (exhibit) {
    ctx.pool.add(
      game.exhibit.emit.present({
        layout: layout ?? (isParadigm ? "PATTERN" : "TABLE"),
        title: title ?? "",
        subtitle,
        literals: forms,
      }),
    );
  }

  if (isParadigm) {
    for (const { paradigm } of items) {
      ctx.pool.add(
        game.paradigm.emit.conjugation({
          conjugation: paradigm,
          recall: "LEARNING",
          feedback: "realtime",
          order: "ordered",
        }),
      );
    }
  } else {
    ctx.pool
      .section(...shuffle(forms).map((literal) => game.flashcard.emit.literals({ literal, recall: "LEARNING" })))
  }
};
