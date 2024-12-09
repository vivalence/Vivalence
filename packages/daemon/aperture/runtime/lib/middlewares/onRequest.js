export default async (ctx, next) => {
  const url = new URL(ctx.request.url).pathname.split("/");
  const slug = url[url.indexOf("runtime") + 1];

  for (const [_, runtime] of ctx.daemon.runtimes) {
    if (runtime.manifest.slug === slug) {
      ctx.runtime = runtime;
      break;
    }
  }
  if (!ctx.runtime) throw new Error("No Runtime found");
  await next();
};
