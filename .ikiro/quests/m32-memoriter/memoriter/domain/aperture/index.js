import { Aperture, shard, is } from "@vivalence/typology";
import { drivers } from "../retention/index.js";

const locate = async (ctx, ref) => {
  if (!ref) return null;
  const query = is.id(ref) ? ref : typeof ref === "string" ? { slug: ref } : ref;
  return ctx.daemon.entities.literal.findOne(query, { populate: ["retentions"] });
};

export const aperture = new Aperture()
  .open("/pick/literal/feed", async (input, ctx) =>
    ctx.daemon.entities.literal.feed(input.where, {
      limit: input.limit || 10,
      blacklist: input.blacklist,
    }),
  )

  .open("/pick/literal/novel", async (input, ctx) =>
    ctx.daemon.entities.literal.novel(input.where, {
      limit: input.limit || 10,
      blacklist: input.blacklist,
    }),
  )

  .open("/pick/literal/due", async (input, ctx) =>
    ctx.daemon.entities.literal.due(input.where, {
      limit: input.limit || 10,
      blacklist: input.blacklist,
    }),
  )

  .open("/pick/literal/byStrength", async (input, ctx) =>
    ctx.daemon.entities.literal.byStrength(input.where, {
      limit: input.limit || 10,
      blacklist: input.blacklist,
    }),
  )

  .open("/review/literal", async (input, ctx) => {
    const { scope = {}, signal } = input;
    const literal = await locate(ctx, scope.literal || input.literal);
    if (!literal) return { status: "bounce", message: "literal not found" };
    const retention = await literal.review(signal, ctx);
    return retention;
  })

  .open("/preview/literal", async (input, ctx) => {
    const literal = await locate(ctx, input.literal);
    if (!literal) return { status: "bounce", message: "literal not found" };
    const retention = literal.retention;
    const driver = drivers[retention?.driver ?? "SM2"];
    return driver.preview(retention?.state ?? null);
  });

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
