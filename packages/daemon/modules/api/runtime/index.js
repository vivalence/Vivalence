export default async function user(api) {
  api.router.route("/user/runtime/view", async (input, ctx) => {
    const user = await ctx.api.locals.getUser();

    const { data, error } = await ctx.api.locals.supabase
      .from("Runtime")
      .select(`id,slug,name,installed,icon`)
      .eq("slug", input.runtime.slug)
      .eq("installed", true)
      .maybeSingle();

    if (error) throw error;

    return data;
  });

  return api;
}
