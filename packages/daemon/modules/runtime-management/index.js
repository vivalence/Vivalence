export default async function runtimeManagement({ router, runtimes, ...params }) {
  router.route("/v/runtime/available/strategies", async (body, ctx) => {
    const runtime = runtimes
      .values()
      .find((runtime) => runtime.manifest.slug === body.runtime.slug);

    const strategies = Array.from(runtime.strategies.values()).map((strategy) => ({
      slug: strategy.manifest.slug,
      name: strategy.manifest.name,
      description: strategy.manifest.description,
    }));

    return strategies;
  });

  router.route("/v/user/join/strategy", async (body, ctx) => {
    const runtime = runtimes.values().find((runtime) => runtime.manifest.id === body.runtime.id);

    const { manifest, Module } = runtime.strategies.get(body.strategy.slug);

    const user = await ctx.locals.getUser();

    const strategy = {
      slug: Module.manifest.slug,
      name: Module.manifest.name,
      description: Module.manifest.description,
      ...Module.strategy,
    };

    const newStrategy = await runtime.call("/install/strategy", {
      user: { id: user.id },
      strategy,
    });

    return newStrategy;
  });

  return { ...params, runtimes, router };
}

//     const session = parseSbBaseAuthToken(ctx.request.headers.get("cookie"));
//     console.log("session", JSON.stringify(session, null, 2));
//     const { data, error } = await ctx.locals.supabase.auth.setSession(session);
// function parseSbBaseAuthToken(cookie) {
//   const match = cookie.match(/sb-base-auth-token=(.*)/);
//   if (!match) {
//     throw new Error("sb-base-auth-token not found in the cookie string");
//   }
//   const base64Value = match[1].replace("base64-", "");
//   const jsonString = atob(base64Value);
//   const tokenData = JSON.parse(jsonString);
//   return tokenData;
// }
