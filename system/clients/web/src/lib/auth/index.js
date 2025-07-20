import Auth from "./Auth.js";

export default function (authority, user) {
  const auth = new Auth(authority);

  // auth.authority.use(async (ctx, next) => {
  //   await next();
  //   if (ctx.response.status === 401) {
  //     const refresh = await auth.refresh();
  //     if (refresh.valid && !ctx.state.isRetry) await ctx.request.retry();
  //   }
  // });

  auth.store.identity.subscribe((identity) => {
    if (identity) {
      identity.shards.runtimes.map((shard) => shard.withAuth(auth));
      user.withIdentity(identity);
    }
  });

  // for (const shard of identity?.shards.runtimes) {
  // shard.withAuth(auth);
  // user.shards.runtimes.push(shard.withAuth(auth));
  // user.shards.runtimes.push(shard.withAuth(auth));
  // console.log(await shard.call("/status"));
  // }

  return auth;
}
