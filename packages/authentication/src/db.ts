import { createClient } from "@supabase/supabase-js";
// import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/dynamic/public";
import { env } from "$env/dynamic/public";

console.log("env", env);

export const supabaseClient = createClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY);
