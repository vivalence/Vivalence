import config from "@vivalence/config";
import { createClient } from "jsr:@supabase/supabase-js@2";

let supabaseUserClient;

export default function createSupabaseUserClient(ctx) {
  if (!supabaseUserClient) {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = config.env;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase URL or Anon Key");
    }

    supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {});
    // cookies: {get: (key) => {const authHeader = ctx.header.authorization; const cookie = ctx.cookies.get(key); if (authHeader && authHeader.startsWith("Bearer ")) {const token = authHeader.slice(7); const session = JSON.parse(token); return session;} else if (cookie) {return decodeURIComponent(cookie);} else {return null;}}}
  }
  return supabaseUserClient;
}
