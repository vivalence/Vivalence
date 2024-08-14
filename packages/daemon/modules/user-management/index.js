export default async function userManagement({ router, ...params }) {
  router.route("/v/user/on/signup", async (body, ctx) => {
    // @domain:user-join
    const { data: user } = await ctx.locals.supabase
      .from("AppUser")
      .select("*")
      .eq("id", body.user.id)
      .single();

    const defaultRuntimeConfig = {
      runtime: { slug: "", strategy: { slug: "" } },
    };

    const config = { ...user.config, ...defaultRuntimeConfig };

    const { data } = await runtime.locals.supabase
      .from("AppUser")
      .update({ config })
      .eq("id", body.user.id)
      .select("*")
      .single();

    return { data };
  });

  return { ...params, router };
}
