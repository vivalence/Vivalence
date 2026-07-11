// learner report — the compact snapshot every aprende render receives as context,
// so the tutor (and its tools) can pick ontologies, counts, and symbol sets without
// extra round trips. Cached per user with a short TTL + inflight dedupe: the report
// is advisory context, not live state. (shard.caching.catchAndRelease exists but
// caches ctx.effect — the Vector contract — so the memo lives here, function-level.)
import { STATUS } from "./types.js";

const TTL = 60_000;
const memos = new Map(); // user id → { at, promise }

async function compose(ctx) {
  const now = Date.now();

  const [literals, memories, weakest, symbols] = await Promise.all([
    ctx.daemon.entities.literal.count({}),
    ctx.daemon.entities.memory.find({}, { fields: ["status", "nextAt"] }),
    ctx.daemon.entities.literal.byStrength({}, { limit: 10 }),
    ctx.daemon.entities.symbol.find({}, { fields: ["slug"] }),
  ]);

  const byStatus = Object.fromEntries(STATUS.map((status) => [status, 0]));
  let due = 0;
  for (const memory of memories) {
    byStatus[memory.status] = (byStatus[memory.status] ?? 0) + 1;
    if (memory.nextAt && memory.nextAt.getTime() <= now) due += 1;
  }

  const domains = symbols
    .map((symbol) => symbol.slug)
    .filter((slug) => slug.startsWith("domain."));

  return {
    literals,
    memories: { total: memories.length, byStatus, due },
    weakest: weakest.map((literal) => ({
      slug: literal.slug,
      learning: literal.trait?.TRANSLATED?.learning ?? "",
      known: literal.trait?.TRANSLATED?.known ?? "",
    })),
    domains,

    toPrompt() {
      return [
        "[Learner report]",
        `Vocabulary: ${this.literals} literals · ${this.memories.total} with memory ` +
          `(${STATUS.map((status) => `${status.toLowerCase()} ${this.memories.byStatus[status]}`).join(" · ")}) · ` +
          `${this.memories.due} due for review.`,
        this.weakest.length
          ? `Weakest words: ${this.weakest
              .map((literal) => `${literal.learning} (${literal.known})`)
              .join(", ")}.`
          : null,
        this.domains.length
          ? `Symbol sets for steering exercises: ${this.domains.join(", ")}.`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
    },
  };
}

export function gather(ctx) {
  const key = ctx.user?.id ?? "local";
  const memo = memos.get(key);
  if (memo && Date.now() - memo.at < TTL) return memo.promise;

  const promise = compose(ctx).catch((error) => {
    memos.delete(key);
    throw error;
  });
  memos.set(key, { at: Date.now(), promise });
  return promise;
}
