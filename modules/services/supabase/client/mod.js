import createSupabaseUserClient from "./user.js";
import createSupabaseAdminClient from "./admin.js";

export default function (config) {
  const supabase = {
    createUserClient: (ctx) => createSupabaseUserClient(ctx),
    createAdminClient: (ctx) => createSupabaseAdminClient(ctx),
  };
  return supabase;
}
