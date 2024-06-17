export default async function (ctx, next) {
    const { supabase } = ctx.locals;
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        ctx.status = 401;
        ctx.body = "Unauthorized";
        console.error("[AUTH ERROR]");
        console.error(data, error, ctx);
        console.error("[/AUTH ERROR]");
        return;
    }

    ctx.state.user = data.user;

    await next();
}
