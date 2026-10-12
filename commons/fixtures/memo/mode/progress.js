import { STATUS } from "../domain/types.js";
import { card } from "../domain/card.js";

export const progress = async (ctx) => {
  const owner = ctx.entities.note.owner();
  const now = new Date().toISOString();
  const cards = await ctx.entities.literal.count({});
  const retentions = await ctx.entities.note.find({ ...owner, slug: { $like: "retention.%" } });
  const suspended = await ctx.entities.note.count({ ...owner, slug: { $like: "suspension.%" } });
  const weakest = await ctx.entities.literal.byStrength({}, { limit: 5 });
  const leeches = await ctx.entities.literal.leeches({}, { limit: 5 });
  const statuses = retentions.map((note) => note.trait.RETAINED.status);
  return {
    cards,
    touched: retentions.length,
    untouched: cards - retentions.length,
    due: retentions.filter((note) => note.trait.RETAINED.due <= now).length,
    suspended,
    byStatus: Object.fromEntries(STATUS.map((status) => [status, status === "UNTOUCHED" ? cards - retentions.length : statuses.filter((held) => held === status).length])),
    weakest: weakest.map(card).map(({ slug, learning, status, lapses }) => ({ slug, learning, status, lapses })),
    leeches: leeches.map(card).map(({ slug, learning, lapses, suspended: out }) => ({ slug, learning, lapses, suspended: out })),
  };
};

export const briefing = (report) =>
  `Today: ${report.due} due, ${report.untouched} untouched of ${report.cards}, ${report.byStatus.GRADUATED} graduated, ${report.leeches.length} leeches, ${report.suspended} suspended.`;
