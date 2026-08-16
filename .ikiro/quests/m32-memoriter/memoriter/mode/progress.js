import { STATUS } from "./types.js";

export const progress = async ({ literal, retention }) => {
  const [cards, touched, dueNow, ...tallies] = await Promise.all([
    literal.count({}),
    retention.count({}),
    retention.count({ nextAt: { $lt: new Date() } }),
    ...STATUS.map((status) => retention.count({ status })),
  ]);
  return {
    cards,
    touched,
    untouched: cards - touched,
    dueNow,
    byStatus: Object.fromEntries(STATUS.map((status, index) => [status, tallies[index]])),
  };
};
