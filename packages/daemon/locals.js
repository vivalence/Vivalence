import createSupabaseAdminClient from "./lib/supabase/admin.js";

export default async function (params) {
  const supabase = createSupabaseAdminClient();

  const locals = {
    supabase,
  };

  return { ...params, locals };
}
