import createSupabaseUserClient from "./user.js";
import createSupabaseAdminClient from "./admin.js";

export default function (params) {
  const supabase = {
    createUserClient: (ctx) => createSupabaseUserClient(ctx),
    createAdminClient: () => createSupabaseAdminClient(),
  };
  return { ...params, supabase };
}
