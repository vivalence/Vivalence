export default async function dependency(aperture) {
  const router = aperture.router.create();

  router.middleware.push(async (ctx, next) => {
    const url = new URL(ctx.request.url).pathname.split("/");
    const slug = url[url.indexOf("dependency") + 1];

    const { data: dependency, error } = await ctx.services.supabase
      .from("Dependency")
      .select("*")
      .eq("slug", slug)
      .eq("runtimeId", ctx.state.runtime.id)
      .maybeSingle();
    if (error || !dependency) throw error || new Error("No dependency found");

    ctx.state.dependency = dependency;

    await next();
  });

  router.route("/", (i, ctx) => ctx.state.dependency);

  aperture.router.use(
    "/dependency/:slug",
    ...router.middleware,
    router.routes(),
    router.allowedMethods(),
  );

  return aperture;
}
