import { v, Vector } from "@vivalence/typology";
import { SIGNAL } from "../types.js";

export const review = new Vector().open(
  {
    nature: "/review",
    valence: [
      "Record the outcome of every literal the learner exercised this exchange. Signals:",
      "MASTERY — effortless and fast · SUCCESS — correct · NEUTRAL — shown or skipped · MISTAKE — wrong but close · FAILURE — blank or wrong.",
      "One call per exchange, at the end, carrying every exercised literal. Never the same literal twice in one call. Never review plain conversation — only items actually exercised.",
      "Each review reschedules the item and answers with its new status and next date; an exchange you do not review never happened.",
    ].join("\n"),
    input: v.object({
      reviews: v.array(
        v.object({
          literal: v.string().desc("The literal's slug, exactly as the read tools report it."),
          signal: v.enum(SIGNAL),
        }),
        { minItems: 1, maxItems: 10 },
      ),
    }),
  },
  async (ctx) => {
    if (!ctx.user?.id) {
      return {
        condition: "ERROR",
        message: "review needs an authorized caller — no user on this path",
      };
    }

    const lines = [];
    const retentions = [];
    for (const item of ctx.input.reviews) {
      const literal = await ctx.daemon.entities.literal.findOne(
        ctx.daemon.entities.literal.reference(item.literal),
      );
      if (!literal) {
        lines.push(`${item.literal} — not in the corpus`);
        continue;
      }
      const retention = await ctx.daemon.call["/review/literal"]({
        user: ctx.user,
        mode: ctx.mode,
        thread: ctx.thread ? { id: ctx.thread } : null,
        input: { literal: literal.slug, signal: item.signal },
      });
      lines.push(
        `${literal.slug} ${item.signal} → ${retention.status}, next ${
          retention.nextAt?.toISOString().slice(0, 10) ?? "—"
        }`,
      );
      retentions.push(retention);
    }
    return { message: lines.join("\n"), entities: { retention: retentions } };
  },
);
