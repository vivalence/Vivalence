import { Aperture } from "@vivalence/typology";
import { is } from "@vivalence/typology";

export const aperture = new Aperture()
  .open("/pick/literal/feed", async (input, ctx) => {
    const { blacklist, where } = input;
    const limit = input.limit || 10;

    return ctx.daemon.entities.literal.feed({ limit, blacklist, where });
  })

  .open("/pick/literal/novel", async (input, ctx) => {
    const { blacklist, where } = input;
    const limit = input.limit || 10;

    return ctx.daemon.entities.literal.novel({ limit, blacklist, where });
  })

  .open("/pick/literal/due", async (input, ctx) => {
    const { blacklist, where } = input;
    const limit = input.limit || 10;

    return ctx.daemon.entities.literal.due({ limit, blacklist, where });
  })

  .open("/pick/literal/byStatus", async (input, ctx) => {
    const { blacklist, where, status } = input;
    const limit = input.limit || 10;

    return ctx.daemon.entities.literal.find(
      {
        memories: { status },
        ...(blacklist?.literals?.length && { id: { $nin: blacklist.literals } }),
        ...where,
      },
      {
        populate: ["memories"],
        orderBy: { rank: "ASC" },
        limit,
      },
    );
  })

  .open("/pick/literal/byStrength", async (input, ctx) => {
    const { blacklist, where } = input;
    const limit = input.limit || 10;

    return ctx.daemon.entities.literal.byStrength({ limit, blacklist, where });
  })

  .open("/review/literal", async (input, ctx) => {
    const { scope = {}, signal } = input;

    const ref = scope.literal || input.literal;
    if (!ref) return { status: "bounce", message: "literal required" };

    const query = is.id(ref) ? ref : typeof ref === "string" ? { slug: ref } : ref;
    const literal = await ctx.daemon.entities.literal.findOne(query);
    if (!literal) return { status: "bounce", message: "literal not found" };

    const memory = await literal.review(signal, ctx);
    return memory;
  });
