import createSupabaseUserClient from "../../lib/supabase/user.js";

export default async function supabase(ctx, next) {
  ctx.state = ctx.state || {};
  ctx.locals = ctx.locals || {};

  ctx.supabase = createSupabaseUserClient(ctx);

  ctx.locals.getUser = async () => {
    const { data } = await ctx.locals.supabase.auth.getUser();
    return data.user;
  };

  ctx.locals.getSession = async () => {
    const { data } = await ctx.locals.supabase.auth.getSession();
    return data.session;
  };

  ctx.state.session = await ctx.locals.getSession();
  ctx.state.user = await ctx.locals.getUser();

  await next();
}
