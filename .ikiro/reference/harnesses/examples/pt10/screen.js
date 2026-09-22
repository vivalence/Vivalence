import { guide } from "./guide.js";

export const threadOf = (ctx) => ctx.thread?.id ?? ctx.thread ?? null;
export const modeOf = (ctx) => ctx.mode?.id ?? null;

export const current = (ctx) => {
  const thread = threadOf(ctx);
  if (!thread) return null;
  return ctx.daemon.entities.buffer.findOne({ thread, mode: modeOf(ctx) }, { orderBy: { index: "desc" } });
};

export const located = (row) => {
  const at = row?.data?.step;
  if (at == null) return "Nothing is on the operator's screen.";
  const held = guide.steps[at];
  return `On the operator's screen: step ${at} · ${held.section} · ${held.title}.`;
};
