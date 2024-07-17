export default async function auth(ctx, next) {
  const { supabase } = ctx.locals;
  const query = await supabase.auth.getUser();
  // console.log("[AUTH]", query);
  const { data, error } = query;

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
