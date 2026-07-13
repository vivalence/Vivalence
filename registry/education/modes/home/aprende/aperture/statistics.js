import { Vector, v } from "@vivalence/typology";
import { STATUS, SIGNAL } from "../types.js";

const tally = (keys) => v.object(Object.fromEntries(keys.map((key) => [key, v.integer()])));

const STATISTICS = v.object({
  totals: v.object({
    literals: v.integer(),
    memories: v.integer(),
    traces: v.integer(),
  }),
  memory: v.object({
    byStatus: tally(STATUS),
    seen: v.integer(), // memories past UNTOUCHED
    due: v.integer(), // nextAt <= now
  }),
  activity: v.object({
    bySignal: tally(SIGNAL),
    streak: v.integer(), // consecutive days, newest backward, with a trace
  }),
});

export const statistics = new Vector().open(
  {
    nature: "/assistant/wakeup/statistics",
    input: v.object({}),
    output: STATISTICS,
  },
  async (ctx) => {
    const { memory, trace, literal } = ctx.daemon.entities;

    const byKey = (repo, where) => async (keys) =>
      Object.fromEntries(
        await Promise.all(keys.map(async (key) => [key, await repo.count(where(key))])),
      );

    const byStatus = await byKey(memory, (status) => ({ status }))(STATUS);
    const bySignal = await byKey(trace, (enumeration) => ({ signal: { enum: enumeration } }))(
      SIGNAL,
    );

    const [literals, memories, traces, due] = await Promise.all([
      literal.count({}),
      memory.count({}),
      trace.count({}),
      memory.count({ nextAt: { $lt: new Date() } }),
    ]);

    // streak — distinct trace-days, newest first, counted while contiguous
    const events = await trace.find({}, { fields: ["createdAt"], orderBy: { createdAt: "DESC" } });
    const days = [...new Set(events.map((event) => event.createdAt.toISOString().slice(0, 10)))];
    const DAY = 86_400_000;
    let streak = 0;
    let cursor = days.length ? Date.parse(days[0]) : 0;
    for (const day of days) {
      if (Date.parse(day) !== cursor) break;
      streak += 1;
      cursor -= DAY;
    }

    return {
      totals: { literals, memories, traces },
      memory: { byStatus, seen: memories - (byStatus.UNTOUCHED ?? 0), due },
      activity: { bySignal, streak },
    };
  },
);
