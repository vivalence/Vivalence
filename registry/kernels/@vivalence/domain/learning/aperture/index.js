import { Aperture } from "@vivalence/typology";
import { is } from "@vivalence/typology";

export const aperture = new Aperture()
  .open("/pick/literal/feed", async (input, ctx) => {
    const { seek, blacklist, batch, stock } = input;
    const take = input.take || (batch || 0) + (stock || 0);

    return ctx.daemon.entities.literal.feed({
      symbols: seek?.symbols,
      user: ctx.user.id,
      take,
      blacklist,
    });
  })

  .open("/pick/literal/novel", async (input, ctx) => {
    const { seek, blacklist, batch, stock } = input;
    const take = input.take || (batch || 0) + (stock || 0);

    return ctx.daemon.entities.literal.novel({
      symbols: seek?.symbols,
      user: ctx.user.id,
      take,
      blacklist,
    });
  })

  .open("/pick/literal/due", async (input, ctx) => {
    const { seek, blacklist, batch, stock } = input;
    const take = input.take || (batch || 0) + (stock || 0);

    return ctx.daemon.entities.literal.due({
      symbols: seek?.symbols,
      user: ctx.user.id,
      take,
      blacklist,
    });
  })

  .open("/pick/literal/byStatus", async (input, ctx) => {
    const { seek, blacklist, status, batch, stock } = input;
    const take = input.take || (batch || 0) + (stock || 0);

    return ctx.daemon.entities.literal.findBySymbols(
      {
        ...(seek?.symbols?.length && { all: seek.symbols }),
        memories: { user: ctx.user.id, status },
        ...(blacklist?.literals?.length && { id: { $nin: blacklist.literals } }),
      },
      {
        populate: ["memories"],
        populateWhere: { memories: { user: ctx.user.id } },
        orderBy: { rank: "ASC" },
        limit: take,
      },
    );
  })

  .open("/pick/literal/byStrength", async (input, ctx) => {
    const { seek, blacklist, batch, stock } = input;
    const take = input.take || (batch || 0) + (stock || 0);

    return ctx.daemon.entities.literal.byStrength({
      symbols: seek?.symbols,
      user: ctx.user.id,
      take,
      blacklist,
    });
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
