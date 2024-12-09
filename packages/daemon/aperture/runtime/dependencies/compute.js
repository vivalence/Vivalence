export default async function (input, ctx) {
  const { data: dependencies, error } = await ctx.runtime.services.supabase
    .from("Dependency")
    .select(`id`)
    .eq("runtimeId", ctx.runtime.manifest.id);

  const computed = await Promise.all(
    dependencies.map((dependency) => {
      return ctx.runtime.call("/dependencies/compute", { dependency });
    }),
  );

  return computed;
}
