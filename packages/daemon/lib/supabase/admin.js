import { createClient } from "jsr:@supabase/supabase-js@2";

let supabaseAdminClient;
export default function createSupabaseAdminClient(ctx) {
  if (!supabaseAdminClient) {
    const { SUPABASE_URL, PRIVATE_SUPABASE_ADMIN_KEY, ...env } = Deno.env.toObject();
    if (!SUPABASE_URL || !PRIVATE_SUPABASE_ADMIN_KEY) {
      throw new Error("Missing Supabase URL or Anon Key");
    }

    supabaseAdminClient = createClient(SUPABASE_URL, PRIVATE_SUPABASE_ADMIN_KEY, {});
  }
  return supabaseAdminClient;
}
