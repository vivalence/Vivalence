import { createServerClient } from "@supabase/ssr";
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = process.env;

export default function createSupabaseClient(ctx) {
    if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY)
        throw new Error("Missing Supabase URL or Anon Key");

    return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get: (key) => {
                // console.log("ctx.header", ctx.header);
                const authHeader = ctx.header.authorization;
                const cookie = ctx.cookies.get(key);
                console.log("supabase server cookies get");
                console.log("authHeader", authHeader && authHeader.slice(0, 50));
                console.log("cookie", key, cookie && cookie.slice(0, 50));

                if (authHeader && authHeader.startsWith("Bearer ")) {
                    const token = authHeader.slice(7);
                    const session = JSON.parse(token);
                    return session;
                } else if (cookie) {
                    return decodeURIComponent(cookie);
                } else {
                    return null;
                }
            }
        }
    });
}
