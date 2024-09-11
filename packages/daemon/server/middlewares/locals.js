import supabase from "../../lib/supabase/index.js";

export default async function locals(ctx, next) {
  ctx.locals = ctx.locals || {};
  // ctx.locals.supabase = supabase.createAdminClient(ctx);
  // lj: because i need to use the user info in the modules.
  ctx.locals.supabase = supabase.createUserClient(ctx);

  ctx.locals.getUser = async () => {
    const { data, error } = await ctx.locals.supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  };

  await next();
}
