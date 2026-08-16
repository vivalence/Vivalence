import { Aperture, object, shard } from "@vivalence/typology";
import { is } from "@vivalence/typology";
import { LANGUAGE } from "../types.js";

const languages = (ctx) => {
  const declared = ctx.daemon.statics?.language ?? {};
  const provided = ctx.daemon.flatmodes().map((mode) => mode.statics?.language ?? {});
  const side = (entry) =>
    entry?.slug ? LANGUAGE.cast(object.merge(...provided.map((table) => table[entry.slug] ?? {}), entry)) : null;
  return { known: side(declared.known), learning: side(declared.learning) };
};

export const aperture = new Aperture()
  .open("/language", (input, ctx) => languages(ctx))

  .open("/pick/literal/feed", async (input, ctx) => {
    return ctx.daemon.entities.literal.feed(input.where, { limit: input.limit || 10, blacklist: input.blacklist });
  })

  .open("/pick/literal/novel", async (input, ctx) => {
    return ctx.daemon.entities.literal.novel(input.where, { limit: input.limit || 10, blacklist: input.blacklist });
  })

  .open("/pick/literal/due", async (input, ctx) => {
    return ctx.daemon.entities.literal.due(input.where, { limit: input.limit || 10, blacklist: input.blacklist });
  })

  .open("/pick/literal/byStatus", async (input, ctx) => {
    const { blacklist, where, status } = input;
    const limit = input.limit || 10;

    return ctx.daemon.entities.literal.find(
      {
        retentions: { status },
        ...(blacklist?.literals?.length && { id: { $nin: blacklist.literals } }),
        ...where,
      },
      {
        populate: ["retentions"],
        orderBy: { rank: "ASC" },
        limit,
      },
    );
  })

  .open("/pick/literal/byStrength", async (input, ctx) => {
    return ctx.daemon.entities.literal.byStrength(input.where, { limit: input.limit || 10, blacklist: input.blacklist });
  })

  .open("/review/literal", async (input, ctx) => {
    const { scope = {}, signal } = input;

    const ref = scope.literal || input.literal;
    if (!ref) return { status: "bounce", message: "literal required" };

    const query = is.id(ref) ? ref : typeof ref === "string" ? { slug: ref } : ref;
    const literal = await ctx.daemon.entities.literal.findOne(query);
    if (!literal) return { status: "bounce", message: "literal not found" };

    const retention = await literal.review(signal, ctx);
    return retention;
  });

// Domain resolve hook — runtime calls this at daemon resolution to wire the
// domain's userspace entity endpoints (needs the per-daemon repos + twitch).
export function resolve(daemonDie) {
  const { entities, twitch, aperture } = daemonDie.good;
  const userspace = aperture.branch("/userspace");

  userspace
    .branch("/entities/trace")
    .slurp(shard.datamap.repository(entities.trace))
    .slurp(shard.datamap.reactive(entities.trace, twitch));

  userspace
    .branch("/entities/retention")
    .slurp(shard.datamap.repository(entities.retention))
    .slurp(shard.datamap.reactive(entities.retention, twitch));
}
