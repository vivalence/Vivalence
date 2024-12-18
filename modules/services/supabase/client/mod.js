import config from "@vivalence/config";

import { createClient } from "@supabase/supabase-js";

let supabaseAdminClient;

export default function () {
  if (!supabaseAdminClient) {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = config.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Missing Supabase URL or Anon Key");
    }

    supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {});
  }
  return supabaseAdminClient;
}
