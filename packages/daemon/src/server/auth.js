export default async function auth(ctx, next) {
    const { supabase } = ctx.state;
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Unauthorized" };
        console.error("[AUTH ERROR]");
        console.error(data, error, ctx);
        console.error("[/AUTH ERROR]");
        return;
    }

    await next();
}
