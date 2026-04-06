export function project(vector, ctx) {
  const rows = [];

  for (const [pattern, child] of vector.trajectories) {
    if (!pattern.treed) continue;
    rows.push(...expand(pattern, ctx, (rowCtx) => project(child, rowCtx), null));
  }

  for (const [pattern, effect] of vector.effects) {
    if (!pattern.treed) continue;
    rows.push(...expand(pattern, ctx, () => [], effect));
  }

  return rows;
}

function expand(pattern, ctx, getKids, effect) {
  const isParameter = pattern.type === "parameter";
  const hasIterated = typeof pattern.iterated === "function";

  if (isParameter && hasIterated) {
    const paramName = pattern.nature.slice(1);
    const items = [...(pattern.iterated(ctx) ?? [])];
    return items.map((item) => {
      const itemCtx = { ...ctx, [paramName]: item };
      return row(item.manifest?.name ?? item.slug ?? String(item), itemCtx, getKids, effect);
    });
  }

  const label = pattern.treed?.label ?? pattern.nature;
  return [row(label, ctx, getKids, effect)];
}

function row(name, ctx, getKids, effect) {
  return {
    name,
    kids: getKids(ctx),
    onClick: effect ? () => effect(ctx) : null,
  };
}
