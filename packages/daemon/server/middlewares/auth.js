export default async function auth(ctx, next) {
  // console.log("[AUTH ROUTES]");
  // console.log(ctx.request);
  // if request.route is /runtime/:id/*
  //     then run user auth
  // if route is /status
  //     public
  // else
  //     run admin auth

  // if (error || !data.user) {
  //   ctx.response.status = 401;
  //   ctx.response.body = { error: "Unauthorized" };
  //   console.error("[AUTH ERROR]");
  //   console.error(data, error, ctx);
  //   console.error("[/AUTH ERROR]");
  //   return;
  // }

  await next();
}
