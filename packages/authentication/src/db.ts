import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/public";
console.log("env", env);
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = env;

export const supabaseClient = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
