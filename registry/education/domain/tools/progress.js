import { v, Vector } from "@vivalence/typology";
import { STATUS } from "../types.js";

export const progress = new Vector().open(
  {
    nature: "/progress",
    valence: "The learner report: counts by retention status, due total, weakest items, and the " +
      "symbol sets available for steering exercises. Open every session with this.",
    input: v.object({}),
  },
  async (ctx) => {
    const now = Date.now();
    const [total, retentions, weakest, symbols] = await Promise.all([
      ctx.daemon.entities.literal.count({}),
      ctx.daemon.entities.retention.find({}, { fields: ["status", "nextAt"] }),
      ctx.daemon.entities.literal.byStrength({}, { limit: 10 }),
      ctx.daemon.entities.symbol.find({}, { fields: ["slug"] }),
    ]);

    const byStatus = Object.fromEntries(STATUS.map((status) => [status, 0]));
    let due = 0;
    for (const retention of retentions) {
      byStatus[retention.status] = (byStatus[retention.status] ?? 0) + 1;
      if (retention.nextAt && retention.nextAt.getTime() <= now) due += 1;
    }

    const domains = symbols
      .map((symbol) => symbol.slug)
      .filter((slug) => slug.startsWith("domain."));

    const message = [
      "[Learner report]",
      `Vocabulary: ${total} literals · ${retentions.length} with retention ` +
      `(${STATUS.map((status) => `${status.toLowerCase()} ${byStatus[status]}`).join(" · ")}) · ` +
      `${due} due for review.`,
      weakest.length
        ? `Weakest words: ${
          weakest
            .map((literal) =>
              `${literal.trait?.TRANSLATED?.learning ?? literal.slug} (${
                literal.trait?.TRANSLATED?.known ?? ""
              })`
            )
            .join(", ")
        }.`
        : null,
      domains.length ? `Symbol sets for steering exercises: ${domains.join(", ")}.` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return { message };
  },
);
