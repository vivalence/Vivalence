export default async function onRequest(ctx, next) {
  const url = new URL(ctx.request.url).pathname.split("/");
  const slug = url[url.indexOf("dependency") + 1];

  const { data: dependency, error } = await ctx.runtime.services.supabase
    .from("Dependency")
    .select("*")
    .eq("slug", slug)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .maybeSingle();

  if (error || !dependency) throw error || new Error("No dependency found");

  ctx.state.dependency = dependency;

  await next();
}
