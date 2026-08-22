export function applyTraits(traitNamespace) {
  return async (ctx, next) => {
    await next();
    const results = await Promise.all(
      (ctx.entity.traits ?? []).map((trait) => traitNamespace[trait]?.(ctx.entity, ctx)),
    );
    for (const finalize of results) if (typeof finalize === "function") await finalize();
  };
}
