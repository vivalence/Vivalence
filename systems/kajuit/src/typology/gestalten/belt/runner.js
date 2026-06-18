export function applyTraits(traitNamespace) {
  return async (ctx, next) => {
    await next();
    const finalizers = [];
    for (const trait of ctx.entity.traits ?? []) {
      const result = await traitNamespace[trait]?.(ctx.entity, ctx);
      if (typeof result === "function") finalizers.push(result);
    }
    for (const finalize of finalizers) await finalize();
  };
}
