import createSupabaseUserClient from "./user.js";
import createSupabaseAdminClient from "./admin.js";

export default function (daemon) {
  daemon.supabase = {
    createUserClient: (ctx) => createSupabaseUserClient(ctx),
    createAdminClient: (ctx) => createSupabaseAdminClient(ctx),
  };
  return daemon;
}
