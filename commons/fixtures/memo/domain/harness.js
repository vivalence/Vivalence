import { Vector } from "@vivalence/typology";
import { SIGNAL, STATUS } from "./types.js";

const GLOSSARY = [
  "This daemon schedules its cards with SM-2, the scheduler Anki ships.",
  `A card's status climbs ${STATUS.join(" → ")}: untouched never graded, unknown lapsed and relearning, learning on its short steps, known reviewed in days, graduated past three weeks.`,
  `A grade is one of ${SIGNAL.join(" · ")}: AGAIN wrong or blank, HARD right with struggle, GOOD right, EASY instant. Every grade is traced, so a card's history is real.`,
  "A suspended card is dealt by nothing until it is resumed; a leech is a card lapsed again and again.",
].join(" ");

export const harness = new Vector().use(async (ctx, next) => {
  ctx.hallucination.system.srs = GLOSSARY;
  await next();
});
