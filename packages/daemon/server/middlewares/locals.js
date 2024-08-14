import supabase from "../../lib/supabase/index.js";

export default async function locals(ctx, next) {
  ctx.locals = ctx.locals || {};
  ctx.locals.supabase = supabase.createAdminClient(ctx);
  await next();
}
