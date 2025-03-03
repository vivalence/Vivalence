async function findDuplicates(input, ctx) {
  let query = ctx.runtime.services.supabase
    .from("Unit")
    .select(`id, createdAt, annotation`)
    .order("createdAt", { ascending: false });

  if (input.batch)
    query = query.range(
      input.batch.index * input.batch.size,
      (input.batch.index + 1) * input.batch.size,
    );
  else if (input.limit) query = query.limit(input.limit);

  const { data: units, error } = await query;

  let issues = [];
  await Promise.all(
    units.map(async (unit) => {
      const duplicates = await ctx.runtime.call("/diagnostics/duplicates/annotation", { unit });
      if (duplicates.length > 0) issues.push(...duplicates);
    }),
  );
  return { issues };
}

async function remedyDuplicates({ issue }, ctx) {
  const input = { unit: { annotation: issue.context.annotation } };
  const duplicates = await ctx.runtime.call("/diagnostics/duplicates/annotation", input);
  if (duplicates[0]) {
    return await ctx.runtime.call("/remedy", { issue: duplicates[0] });
  } else {
    return { resolved: true, action: "none" };
  }
}

export default async function duplicates(aperture) {
  aperture.router.route("/duplicates/find", findDuplicates);
  aperture.router.route("/duplicates/remedy", remedyDuplicates);

  return aperture;
}
