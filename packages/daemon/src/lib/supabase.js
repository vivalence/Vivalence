import { createServerClient } from "@supabase/ssr";

const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = process.env;

export default function createSupabaseClient(ctx) {
    if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY)
        throw new Error("Missing Supabase URL or Anon Key");

    return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        // cookies: {
        //     get: (key) => {
        //         const authHeader = ctx.header.authorization;
        //         const cookie = ctx.cookies.get(key);
        //         if (authHeader && authHeader.startsWith("Bearer ")) {
        //             const token = authHeader.slice(7);
        //             const session = JSON.parse(token);
        //             return session;
        //         } else if (cookie) {
        //             return decodeURIComponent(cookie);
        //         } else {
        //             return null;
        //         }
        //     }
        // }
    });
}
